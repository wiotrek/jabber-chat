import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { PublicUser } from '../users/user.presenter.js';
import { ChannelsService } from './channels.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ChannelDto } from './dto/channel.dto.js';
import { toPublicChannel, type PublicChannel } from './channel.presenter.js';
import { Message } from "../messages/entities/message.entity.js";
import { Channel } from "./entities/channel.entity.js";

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getChannels(@CurrentUser() user: PublicUser): Promise<Channel[]> {
    return await this.channelsService.getChannels(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':channelId')
  async get(
    @CurrentUser() user: PublicUser,
    @Param('channelId') channelId: string,
  ): Promise<Message[]> {
    return await this.channelsService.getMessages(user.id, channelId);
  }

  @UseGuards(JwtAuthGuard)
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
}
