import { countWords, getPlanLimit, hasEnoughCredits, deductCredits, isNewDay } from '../../lib/credits';
import { PlanType } from '../../models/User';

describe('Credit System Unit Tests', () => {
  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('   Multiple   spaces   ')).toBe(2);
      expect(countWords('')).toBe(0);
      expect(countWords('One')).toBe(1);
    });
  });

  describe('getPlanLimit', () => {
    it('should return correct limits for each plan', () => {
      expect(getPlanLimit('free' as PlanType)).toBe(800);
      expect(getPlanLimit('starter' as PlanType)).toBe(5000);
      expect(getPlanLimit('pro' as PlanType)).toBe(20000);
    });
  });

  describe('hasEnoughCredits', () => {
    it('should return true if credits are sufficient', () => {
      const user = { creditsRemaining: 100 } as any;
      expect(hasEnoughCredits(user, 50)).toBe(true);
      expect(hasEnoughCredits(user, 100)).toBe(true);
    });

    it('should return false if credits are insufficient', () => {
      const user = { creditsRemaining: 100 } as any;
      expect(hasEnoughCredits(user, 101)).toBe(false);
    });
  });

  describe('isNewDay', () => {
    it('should detect a new day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isNewDay(yesterday)).toBe(true);
    });

    it('should detect same day', () => {
      const now = new Date();
      expect(isNewDay(now)).toBe(false);
    });
  });

  describe('deductCredits', () => {
    it('should deduct credits correctly', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const user = { creditsRemaining: 100, save: mockSave } as any;
      
      const updatedUser = await deductCredits(user, 30);
      expect(updatedUser.creditsRemaining).toBe(70);
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
