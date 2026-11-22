import { Component, inject, OnInit, signal } from '@angular/core';
import { ChannelsService } from '../_services/channels.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: false,
  styleUrl: './channel.scss',
  templateUrl: './channel.html',
})
export class Channel implements OnInit {
  private readonly channelsService = inject(ChannelsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly messages = this.channelsService.messages;
  private readonly channelIdSignal = signal('');
  readonly messageInput = signal('');

  ngOnInit(): void {
    const channelId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.channelIdSignal.set(channelId);
    this.channelsService.loadMessages(channelId);
  }

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content) {
      return;
    }

    this.channelsService.sendMessage(this.channelIdSignal(), content);
    this.messageInput.set('');
  }

  onMessageInput(event: Event): void {
    this.messageInput.set((event.target as HTMLInputElement).value);
  }
}
