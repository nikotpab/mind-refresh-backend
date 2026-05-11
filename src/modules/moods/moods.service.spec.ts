import { Test, TestingModule } from '@nestjs/testing';
import { MoodsService } from './moods.service';
import { MoodRepository } from './mood.repository';
import { BadRequestException } from '@nestjs/common';

describe('MoodsService', () => {
  let service: MoodsService;
  let repository: jest.Mocked<MoodRepository>;

  const mockMood = {
    id: '1',
    userId: 'user1',
    emotion: 'sentiment_satisfied',
    notes: 'good',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodsService,
        { provide: MoodRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<MoodsService>(MoodsService);
    repository = module.get(MoodRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should allow creation if no mood today', async () => {
    // Return empty list so it passes validation
    repository.findByUserId.mockResolvedValue([]);
    repository.create.mockResolvedValue(mockMood);

    const result = await service.create('user1', { emotion: 'sentiment_satisfied' });
    expect(result).toEqual(mockMood);
  });

  it('should reject creation if mood already exists today', async () => {
    repository.findByUserId.mockResolvedValue([mockMood]);
    
    await expect(service.create('user1', { emotion: 'sentiment_satisfied' }))
      .rejects.toThrow(BadRequestException);
  });

  it('should find all by user', async () => {
    repository.findByUserId.mockResolvedValue([mockMood]);
    const res = await service.findByUserId('user1');
    expect(res.length).toBe(1);
  });
});
