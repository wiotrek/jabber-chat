import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { PublicUser } from '../users/user.presenter.js';
import { ChannelsService } from './channels.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ChannelDto } from './dto/channel.dto.js';
import { toPublicChannel, type PublicChannel } from './channel.presenter.js';
import {
  toPublicMessage,
  type PublicMessage,
} from '../messages/message.presenter.js';
import { ChannelAssignDto } from './dto/channel-assign.dto.js';
import { use } from 'passport';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  async getChannels(@CurrentUser() user: PublicUser): Promise<PublicChannel[]> {
    const channels = await this.channelsService.getChannels(user.id);
    return channels.map(toPublicChannel);
  }

  @Get(':id')
  async get(
    @CurrentUser() user: PublicUser,
    @Param('id') channelId: string,
  ): Promise<PublicMessage[]> {
    const messages = await this.channelsService.getMessages(user.id, channelId);
    return messages.map(toPublicMessage);
  }

  @Post('create')
  async create(
    @CurrentUser() user: PublicUser,
    @Body() dto: ChannelDto,
  ): Promise<PublicChannel> {
    const channel = await this.channelsService.create(user.id, {
      name: dto.name,
      password: dto.password,
    });
    return toPublicChannel(channel);
  }

  @Post('assign/:id')
  async assign(
    @CurrentUser() user: PublicUser,
    @Param('id') channelId: string,
    @Body() dto: ChannelAssignDto,
  ): Promise<PublicMessage[]> {
    await this.channelsService.assignUserToChannel(
      user.id,
      { channelId, password: dto.password }
    )
    const messages = await this.channelsService.getMessages(user.id, channelId);
    return messages.map(toPublicMessage);
  }
}
