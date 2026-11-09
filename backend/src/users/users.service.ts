import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async checkUserExist(id: string): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not exist');
    }

    return user;
  }

  async create(params: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: params.email,
      username: params.username,
      displayName: params.displayName,
    });
    await user.setPassword(params.password);
    return this.usersRepository.save(user);
  }
}
