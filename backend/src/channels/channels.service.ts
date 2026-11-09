import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Message } from '../messages/entities/message.entity.js';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    params: {
      name: string;
      password: string;
    },
  ): Promise<Channel> {
    const user: User | null = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not exist');
    }
    const channel = this.channelsRepository.create({
      name: params.name,
      users: [user],
    });
    await channel.setPassword(params.password);
    return this.channelsRepository.save(channel);
  }

  async getChannels(userId: string): Promise<Channel[]> {
    return await this.channelsRepository.findBy({ users: { id: userId } });
  }

  async getMessages(userId: string, channelId: string): Promise<Message[]> {
    await this.channelsRepository.findOneByOrFail({
      id: channelId,
      users: { id: userId },
    });
    return this.messagesRepository.find({
      where: { channelId },
      order: { createdAt: 'ASC' },
      relations: { user: true },
    });
  }

  async isUserExistInChannel(
    channelId: string,
    userId: string,
  ): Promise<boolean> {
    const channel = await this.channelsRepository.findOneBy({
      id: channelId,
      users: { id: userId },
    });
    return !!channel;
  }
}
