import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { PublicUser } from '../users/user.presenter.js';
import { ChannelsService } from './channels.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ChannelDto } from './dto/channel.dto.js';
import { toPublicChannel, type PublicChannel } from './channel.presenter.js';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getList(@CurrentUser() user: PublicUser): Promise<PublicChannel[]> {

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
