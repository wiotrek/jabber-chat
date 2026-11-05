import type { Message } from './entities/message.entity.js';

export interface PublicMessage {
  id: string;
  content: string;
  senderId: string;
  channelId: string;
  createdAt: Date;
}

/** Shapes a Message for the API response instead of returning the raw entity. */
export function toPublicMessage(message: Message): PublicMessage {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    channelId: message.channelId,
    createdAt: message.createdAt,
  };
}
