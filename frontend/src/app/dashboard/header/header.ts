import { Component, inject, signal } from '@angular/core';
import { ChannelsService } from '../_services/channels.service';

@Component({
  selector: 'app-header',
  standalone: false,
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  protected readonly channelsService = inject(ChannelsService);
  protected readonly copied = signal(false);

  async copyChannelId(id: string): Promise<void> {
    await navigator.clipboard.writeText(id);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
