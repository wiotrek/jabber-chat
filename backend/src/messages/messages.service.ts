import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity.js';
import { Repository } from 'typeorm';
import { MessageDto } from './dto/message.dto.js';
import { ChannelsService } from '../channels/channels.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly channelService: ChannelsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    channelId: string,
    dto: MessageDto,
  ): Promise<void> {
    const userIsExist = await this.usersService.isUserExist(userId);

    if (!userIsExist) {
      throw new NotFoundException('User not exist');
    }

    const userIsInChannel = await this.channelService.isUserExistInChannel(
      channelId,
      userId,
    );

    if (!userIsInChannel) {
      throw new NotFoundException('User is not in channel');
    }

    const message = this.messagesRepository.create({
      content: dto.content,
      senderId: userId,
      channelId: channelId,
    });

    await this.messagesRepository.save(message);
  }
}
