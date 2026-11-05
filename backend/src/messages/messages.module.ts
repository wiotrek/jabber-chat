import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  exports: [TypeOrmModule],
})
export class MessagesModule {}
