import { Component, inject, effect } from '@angular/core';
import { ChannelsService } from '../_services/channels.service';
import { AuthService } from '../../auth/_service/auth.service';

@Component({
  selector: 'app-left-panel',
  standalone: false,
  templateUrl: 'left-panel.html',
  styleUrl: 'left-panel.scss'
})
export class LeftPanel {
  private readonly channelsService = inject(ChannelsService);
  private readonly authService = inject(AuthService);

  readonly channels = this.channelsService.channels;

  constructor() {
    effect(() => {
      this.channelsService.loadChannels();
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
