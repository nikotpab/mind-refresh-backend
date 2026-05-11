import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from './notification.repository';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<NotificationRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      markAsRead: jest.fn(),
    };
    const mockGateway = {
      sendNotificationToUser: jest.fn(),
    };
    const mockUsers = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationRepository, useValue: mockRepo },
        { provide: NotificationsGateway, useValue: mockGateway },
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(NotificationRepository);
  });

  it('should create notification', async () => {
    repo.create.mockResolvedValue({ id: '1', userId: 'user1' });
    const res = await service.create('user1', { title: 'Test' });
    expect(res.id).toBe('1');
  });

  it('should get notifications', async () => {
    repo.findByUserId.mockResolvedValue([{ id: '1', createdAt: new Date() }]);
    const res = await service.getNotifications('user1');
    expect(res.length).toBe(1);
  });

  it('should mark as read', async () => {
    repo.markAsRead.mockResolvedValue(undefined);
    await service.markAsRead('1');
    expect(repo.markAsRead).toHaveBeenCalledWith('1');
  });
});
