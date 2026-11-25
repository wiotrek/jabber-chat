import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity.js';
import { MessagesService } from './messages.service.js';
import { MessagesController } from './messages.controller.js';
import { MessagesGateway } from './messages.gateway.js';
import { UsersModule } from '../users/users.module.js';
import { ChannelsModule } from '../channels/channels.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    UsersModule,
    ChannelsModule,
    AuthModule,
  ],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  exports: [TypeOrmModule, MessagesService],
})
export class MessagesModule {}
