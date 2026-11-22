import { Component, inject, OnInit } from '@angular/core';
import { ChannelsService } from '../_services/channels.service';
import { ActivatedRoute } from '@angular/router';
import { MessageModel } from '../_models/message.model';

@Component({
  selector: 'app-messages',
  standalone: false,
  styleUrl: './channel.scss',
  templateUrl: './channel.html',
})
export class Channel implements OnInit {
  private readonly channelsService = inject(ChannelsService);
  private readonly activatedRoute = inject(ActivatedRoute);

  messages: MessageModel[] = [];

  ngOnInit(): void {
    const channelId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';
    this.channelsService.loadMessages(channelId).subscribe((m) => {
      this.messages = m;
    });
  }
}
