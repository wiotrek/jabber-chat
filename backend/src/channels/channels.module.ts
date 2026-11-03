import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity.js';
import { ChannelsService } from './channels.service.js';
import { UsersModule } from '../users/users.module.js';
import { ChannelsController } from './channels.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    UsersModule
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [TypeOrmModule, ChannelsService],
})
export class ChannelsModule {}
