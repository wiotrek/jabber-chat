import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { ChannelsService } from './channels.service.js';
import { UsersModule } from '../users/users.module.js';
import { ChannelsController } from './channels.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message]),
    UsersModule
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [TypeOrmModule, ChannelsService],
})
export class ChannelsModule {}
