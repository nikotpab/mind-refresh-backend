import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventRepository } from './event.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

describe('EventsService', () => {
  let service: EventsService;
  let eventRepository: jest.Mocked<EventRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const mockNotifications = {
      create: jest.fn().mockResolvedValue(null),
      createByEmail: jest.fn().mockResolvedValue(null),
    };
    const mockUsers = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventRepository, useValue: mockRepo },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventRepository = module.get(EventRepository);
  });

  it('should create event', async () => {
    eventRepository.create.mockResolvedValue({ id: '1', title: 'Event' });
    const result = await service.create({ title: 'Event' });
    expect(result.id).toBe('1');
  });

  it('should find all events', async () => {
    eventRepository.findAll.mockResolvedValue([{ id: '1', title: 'Event' }]);
    const result = await service.findAll();
    expect(result.length).toBe(1);
  });

  it('should enroll user', async () => {
    eventRepository.findById.mockResolvedValue({ id: '1', participants: [] });
    const result = await service.enroll('1', 'user1');
    expect(result.alreadyEnrolled).toBe(false);
  });

  it('should not enroll if already enrolled', async () => {
    eventRepository.findById.mockResolvedValue({ id: '1', participants: ['user1'] });
    const result = await service.enroll('1', 'user1');
    expect(result.alreadyEnrolled).toBe(true);
  });
});
