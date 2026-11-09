import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity.js';
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

  async assignUserToChannel(
    userId: string,
    params: { channelId: string; password: string; }
  ): Promise<void> {
    const user = await this.usersService.checkUserExist(userId);
    const channel = await this.checkChannelExist(params.channelId);
    const checkPass = await channel.comparePassword(params.password);

    if (!checkPass) {
      throw new UnauthorizedException("Password or Channel is not correct");
    }

    const alreadyMember = channel.users
      .some((member) => member.id === user.id);
    if (alreadyMember) { return; }

    channel.users.push(user);
    await this.channelsRepository.save(channel);
  }

  async checkChannelExist(channelId: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { id: channelId },
      select: { id: true, name: true, password: true },
      relations: { users: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not exist');
    }

    return channel;
  }

  async checkUserInChannel(channelId: string, userId: string): Promise<void> {
    const channel = await this.channelsRepository.findOneBy({
      id: channelId,
      users: { id: userId },
    });

    if (!channel) {
      throw new NotFoundException('User is not in channel');
    }
  }

  async create(
    userId: string,
    params: {
      name: string;
      password: string;
    },
  ): Promise<Channel> {
    const user = await this.usersService.checkUserExist(userId);
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
}
