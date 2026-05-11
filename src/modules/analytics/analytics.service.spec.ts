import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { MoodsService } from '../moods/moods.service';
import { UsersService } from '../users/users.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const mockMoods = {
      findAll: jest.fn().mockResolvedValue([
        { emotion: 'sentiment_satisfied', userId: '1' }
      ]),
    };
    const mockUsers = {
      findAll: jest.fn().mockResolvedValue([
        { id: '1', department: 'IT' }
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: MoodsService, useValue: mockMoods },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should calculate analytics', async () => {
    const result = await service.getTeamMoodAnalytics();
    expect(result.totalRecords).toBe(1);
    expect(result.summary.sentiment_satisfied).toBe(1);
  });
});
