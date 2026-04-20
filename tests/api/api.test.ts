import { POST as generateHandler } from '../../app/api/generate/route';
import { POST as createFormHandler } from '../../app/api/create-form/route';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '../../lib/db';
import User from '../../models/User';
import { generateForm } from '../../lib/openai';
import { createGoogleForm } from '../../lib/google';

// Mock everything
jest.mock('next-auth/next');
jest.mock('../../lib/db');
jest.mock('../../models/User');
jest.mock('../../lib/openai');
jest.mock('../../lib/google');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/generate', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const req = new Request('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Create a test form' }),
      });

      const res = await generateHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if insufficient credits', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
      (connectDB as jest.Mock).mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        creditsRemaining: 2,
        lastReset: new Date(),
        plan: 'free',
        save: jest.fn().mockResolvedValue(true),
      });

      const req = new Request('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'This prompt has more than two words' }),
      });

      const res = await generateHandler(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toBe('Not enough credits');
    });

    it('should return success if credits are sufficient', async () => {
      const mockUser = {
        email: 'test@example.com',
        creditsRemaining: 100,
        lastReset: new Date(),
        plan: 'free',
        save: jest.fn().mockResolvedValue(true),
      };
      (getServerSession as jest.Mock).mockResolvedValue({ user: { email: 'test@example.com' } });
      (connectDB as jest.Mock).mockResolvedValue(true);
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateForm as jest.Mock).mockResolvedValue({
        title: 'Test Form',
        questions: [{ question: 'Q1', type: 'short_text' }],
      });

      const req = new Request('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Valid prompt' }),
      });

      const res = await generateHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('Test Form');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/create-form', () => {
    it('should return success and link', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ accessToken: 'fake-token' });
      (createGoogleForm as jest.Mock).mockResolvedValue({ link: 'https://forms.google.com/test' });

      const req = new Request('http://localhost/api/create-form', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Form',
          questions: [{ question: 'Q1', type: 'short_text' }],
        }),
      });

      const res = await createFormHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.link).toBe('https://forms.google.com/test');
    });

    it('should return 400 for invalid schema', async () => {
      (getServerSession as jest.Mock).mockResolvedValue({ accessToken: 'fake-token' });

      const req = new Request('http://localhost/api/create-form', {
        method: 'POST',
        body: JSON.stringify({
          title: '', // Invalid title
          questions: [],
        }),
      });

      const res = await createFormHandler(req);
      expect(res.status).toBe(400);
    });
  });
});
