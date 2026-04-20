// Mock environment variables
process.env.OPENAI_API_KEY = 'test-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.NEXTAUTH_SECRET = 'test-secret';

// Mock Next.js globals if necessary
global.fetch = jest.fn();
