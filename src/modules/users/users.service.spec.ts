import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test',
    passwordHash: 'hash',
    role: 'Employee',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by email', async () => {
    repository.findByEmail.mockResolvedValue(mockUser);
    const result = await service.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should find all users', async () => {
    repository.findAll.mockResolvedValue([mockUser]);
    const result = await service.findAll();
    expect(result).toEqual([mockUser]);
  });

  it('should find user by id', async () => {
    repository.findById.mockResolvedValue(mockUser);
    const result = await service.findById('1');
    expect(result).toEqual(mockUser);
  });

  it('should create user', async () => {
    repository.create.mockResolvedValue(mockUser);
    const result = await service.create(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should update user', async () => {
    repository.update.mockResolvedValue(undefined);
    await service.update('1', { name: 'New Name' });
    expect(repository.update).toHaveBeenCalledWith('1', { name: 'New Name' });
  });
});
