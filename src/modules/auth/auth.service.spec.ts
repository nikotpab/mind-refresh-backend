import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should validate user correctly', async () => {
    usersService.findByEmail.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const user = await service.validateUser('test@test.com', 'password');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@test.com');
  });

  it('should return null for invalid user', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    const user = await service.validateUser('test@test.com', 'password');
    expect(user).toBeNull();
  });

  it('should login user and return token', async () => {
    jwtService.sign.mockReturnValue('token');
    const result = await service.login({ email: 'test@test.com', id: '1', role: 'Employee' } as any);
    expect(result.access_token).toBe('token');
  });

  it('should register a new user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    usersService.create.mockResolvedValue({ id: '1', email: 'new@test.com' } as any);

    const result = await service.register({ email: 'new@test.com', password: 'password', name: 'Test' } as any);
    expect(result.id).toBe('1');
  });
});
