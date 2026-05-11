import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(user: Partial<User>): Promise<User> {
    return this.userRepository.create(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findAll(limit: number = 20, lastId?: string): Promise<User[]> {
    return this.userRepository.findAll(limit, lastId);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    return this.userRepository.update(id, data);
  }
}
