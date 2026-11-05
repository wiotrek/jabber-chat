import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { MessagesService } from './messages.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { type PublicUser } from '../users/user.presenter.js';
import { MessageDto } from './dto/message.dto.js';


@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':channelId')
  async createMessage(
    @CurrentUser() user: PublicUser,
    @Param('channelId') channelId: string,
    @Body() dto: MessageDto,
  ): Promise<void> {
    await this.messagesService.create(user.id, channelId, dto);
    return;
  }
}
