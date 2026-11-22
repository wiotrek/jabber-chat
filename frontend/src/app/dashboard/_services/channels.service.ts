import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Channel } from '../_models/channel.model';
import { environment } from '../../../environments/environment.development';
import { MessageModel } from '../_models/message.model';

const API_URL = environment.API_URL;

@Service()
export class ChannelsService {
  private readonly http = inject(HttpClient);
  private readonly channelsSignal = signal<Channel[]>([]);

  readonly channels = this.channelsSignal.asReadonly();

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

  loadMessages(channelId: string): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${API_URL}/channels/${channelId}`);
  }
}
