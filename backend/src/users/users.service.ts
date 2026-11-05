import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'username', 'password', 'displayName', 'avatarUrl', 'createdAt', 'updatedAt'],
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
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
