import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity.js';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Message } from "../messages/entities/message.entity.js";
import { channel } from "node:diagnostics_channel";

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

  async getChannels(userId: string): Promise<Channel[]> {
    return await this.channelsRepository.findBy({ users: { id: userId }});
  }

  async getMessages(userId: string, channelId: string): Promise<Message[]> {
    const result: Channel = await this.channelsRepository.findOneByOrFail({
      id: channelId,
      users: { id: userId }
    });
    return result.messages;
  }
}
