import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChannelsService } from '../_services/channels.service';

type ModalMode = 'create' | 'assign' | null;

@Component({
  selector: 'app-channel-new',
  standalone: false,
  styleUrl: './channel-new.scss',
  templateUrl: './channel-new.html',
})
export class ChannelNew {
  private readonly channelsService = inject(ChannelsService);
  private readonly router = inject(Router);

  readonly modalMode = signal<ModalMode>(null);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly name = signal('');
  readonly channelId = signal('');
  readonly password = signal('');

  openCreateModal(): void {
    this.resetForm();
    this.modalMode.set('create');
  }

  openAssignModal(): void {
    this.resetForm();
    this.modalMode.set('assign');
  }

  closeModal(): void {
    this.modalMode.set(null);
  }

  onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  onChannelIdInput(event: Event): void {
    this.channelId.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  async submitCreate(): Promise<void> {
    const name = this.name().trim();
    const password = this.password();

    if (!name || !password) {
      this.error.set('Fill in all fields');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      const channel = await this.channelsService.createChannel(name, password);
      this.closeModal();
      await this.router.navigate(['/', channel.id]);
    } catch {
      this.error.set('Failed to create channel');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async submitAssign(): Promise<void> {
    const channelId = this.channelId().trim();
    const password = this.password();

    if (!channelId || !password) {
      this.error.set('Fill in all fields');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    try {
      await this.channelsService.assignChannel(channelId, password);
      this.closeModal();
      await this.router.navigate(['/', channelId]);
    } catch {
      this.error.set('Failed to assign to channel');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private resetForm(): void {
    this.name.set('');
    this.channelId.set('');
    this.password.set('');
    this.error.set(null);
  }
}
