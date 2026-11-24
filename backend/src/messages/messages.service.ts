import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity.js';
import { Repository } from 'typeorm';
import { MessageDto } from './dto/message.dto.js';
import { ChannelsService } from '../channels/channels.service.js';
import { UsersService } from '../users/users.service.js';
import { MessageSchema } from './schema/message.schema.js';

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
  ): Promise<MessageSchema> {
    const user = await this.usersService.checkUserExist(userId);
    await this.channelService.checkUserInChannel(channelId, userId);

    const message = this.messagesRepository.create({
      content: dto.content,
      senderId: userId,
      channelId: channelId,
    });

    const response = await this.messagesRepository.save(message);

    return {
      id: response.id,
      content: dto.content,
      createdAt: response.createdAt,
      senderUsername: user.displayName
    } as MessageSchema;
  }
}
