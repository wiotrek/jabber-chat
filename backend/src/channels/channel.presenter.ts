import type { Channel } from './entities/channel.entity.js';

export interface PublicChannel {
  id: string;
  name: string;
}

/** Strips the password hash (and anything else sensitive) before a Channel leaves the API. */
export function toPublicChannel(channel: Channel): PublicChannel {
  return {
    id: channel.id,
    name: channel.name,
  };
}
