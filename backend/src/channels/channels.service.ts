import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    private readonly usersService: UsersService
  ) {}

  async create(userId: string, params: {
    name: string;
    password: string;
  }): Promise<Channel> {
    const user: User | null = await this.usersService.findById(userId);
    if (!user) {
      throw new ConflictException('User not exist');
    }
    const channel = this.channelsRepository.create({
      name: params.name,
      users: [user]
    });
    await channel.setPassword(params.password);
    return this.channelsRepository.save(channel);
  }

  async getChannel(userId: string, groupId: string): Promise<Channel> {
    const user: User | null = await this.usersService.findById(userId);
    if (!user) {
      throw new ConflictException('User not exist');
    }

    const channel = this.channelsRepository.findOneById(groupId);
  }
}
