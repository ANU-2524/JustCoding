const BadgeService = require('../../services/BadgeService');

// Mock the models
jest.mock('../../models/Achievement', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  insertMany: jest.fn(),
  countDocuments: jest.fn()
}));

jest.mock('../../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  updateOne: jest.fn()
}));

jest.mock('../../models/LearningEvent', () => ({
  countDocuments: jest.fn(),
  create: jest.fn()
}));

const Achievement = require('../../models/Achievement');
const User = require('../../models/User');
const LearningEvent = require('../../models/LearningEvent');

describe('BadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeBadges', () => {
    it('should initialize badges if none exist', async () => {
      Achievement.countDocuments.mockResolvedValue(0);
      Achievement.insertMany.mockResolvedValue([]);

      await BadgeService.initializeBadges();

      expect(Achievement.countDocuments).toHaveBeenCalled();
      expect(Achievement.insertMany).toHaveBeenCalled();
    });

    it('should skip initialization if badges exist', async () => {
      Achievement.countDocuments.mockResolvedValue(10);

      await BadgeService.initializeBadges();

      expect(Achievement.countDocuments).toHaveBeenCalled();
      expect(Achievement.insertMany).not.toHaveBeenCalled();
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges', async () => {
      const mockBadges = [
        { badgeId: 'first_run', name: 'First Run' },
        { badgeId: 'code_warrior', name: 'Code Warrior' }
      ];
      Achievement.find.mockResolvedValue(mockBadges);

      const result = await BadgeService.getAllBadges();

      expect(result).toEqual(mockBadges);
      expect(Achievement.find).toHaveBeenCalled();
    });
  });

  describe('getUserBadges', () => {
    it('should return user badges', async () => {
      const mockUser = {
        earnedBadges: ['first_run', 'code_warrior']
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await BadgeService.getUserBadges('user123');

      expect(result).toEqual(mockUser.earnedBadges);
    });

    it('should return empty array if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const result = await BadgeService.getUserBadges('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
