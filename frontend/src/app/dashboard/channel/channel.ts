import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { ChannelsService } from '../_services/channels.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: false,
  styleUrl: './channel.scss',
  templateUrl: './channel.html',
})
export class Channel implements OnInit, OnDestroy {
  private readonly messagesRef = viewChild<ElementRef<HTMLDivElement>>('messagesRef');

  private readonly channelsService = inject(ChannelsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly messages = this.channelsService.messages;
  readonly messageInput = signal('');

  constructor() {
    effect(() => {
      this.messages();
      queueMicrotask(() => this.scrollToLastMessage());
    });
  }

  ngOnInit(): void {
    const channelId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.channelsService.loadMessages(channelId).then(() => {
      this.channelsService.setCurrentChannelSignal(channelId);
    });
  }

  private scrollToLastMessage(): void {
    const container = this.messagesRef()?.nativeElement;
    const lastMessage = container?.lastElementChild;
    lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  sendMessage(): void {
    const content = this.messageInput().trim();
    if (!content) {
      return;
    }

    const currentChannel = this.channelsService.currentChannelSignal();
    if (currentChannel !== null) {
      this.channelsService.sendMessage(currentChannel.id, content);
    }
    this.messageInput.set('');
  }

  onMessageInput(event: Event): void {
    this.messageInput.set((event.target as HTMLInputElement).value);
  }

  ngOnDestroy(): void {
    this.channelsService.setCurrentChannelSignal(null);
  }
}
