import type { Message } from './entities/message.entity.js';

export interface PublicMessage {
  id: string;
  content: string;
  senderUsername: string;
  createdAt: Date;
}

/**
 * Shapes a Message for the API response instead of returning the raw entity.
 * Requires `message.user` to be loaded (e.g. via `relations: { user: true }`).
 */
export function toPublicMessage(message: Message): PublicMessage {
  return {
    id: message.id,
    content: message.content,
    senderUsername: message.user.username,
    createdAt: message.createdAt,
  };
}
