import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Channel } from '../_models/channel.model';
import { environment } from '../../../environments/environment.development';
import { MessageModel } from '../_models/message.model';
import { WebSocketService } from './websocket.service';

const API_URL = environment.API_URL;

@Service()
export class ChannelsService {
  private readonly http = inject(HttpClient);
  private readonly webSocket = inject(WebSocketService);
  private readonly channelsSignal = signal<Channel[]>([]);
  private readonly messagesSignal = signal<MessageModel[]>([]);

  readonly channels = this.channelsSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();

  async loadChannels(): Promise<Channel[]> {
    try {
      const channels = await firstValueFrom(
        this.http.get<Channel[]>(`${API_URL}/channels`),
      );
      this.channelsSignal.set(channels);
      return channels;
    } catch (error) {
      console.error('Failed to load channels:', error);
      this.channelsSignal.set([]);
      return [];
    }
  }

  async createChannel(name: string, password: string): Promise<Channel> {
    const channel = await firstValueFrom(
      this.http.post<Channel>(`${API_URL}/channels/create`, { name, password }),
    );
    this.channelsSignal.update((channels) => [...channels, channel]);
    return channel;
  }

  async assignChannel(channelId: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API_URL}/channels/assign/${channelId}`, { password }),
    );
    await this.loadChannels();
  }

  async loadMessages(channelId: string): Promise<MessageModel[]> {
    try {
      const messages = await firstValueFrom(
        this.http.get<MessageModel[]>(`${API_URL}/channels/${channelId}`),
      );
      this.messagesSignal.set(messages);
      this.connectToChannel(channelId);
      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  private connectToChannel(channelId: string): void {
    this.webSocket.connect();
    this.webSocket.emit('join_channel', { channelId });

    this.webSocket.on(`message:${channelId}`, (message: MessageModel) => {
      this.messagesSignal.update((msgs) => [...msgs, message]);
    });
  }

  sendMessage(channelId: string, content: string): void {
    this.webSocket.emit('send_message', { channelId, content });
  }
}
