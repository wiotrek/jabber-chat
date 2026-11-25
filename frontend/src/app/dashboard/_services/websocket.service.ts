import { Service, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../../auth/_service/auth.service';
import { environment } from '../../../environments/environment.development';

@Service()
export class WebSocketService {
  private readonly authService = inject(AuthService);
  private socket: Socket | null = null;
  private connectedSignal = signal(false);

  readonly connected = this.connectedSignal.asReadonly();

  connect(): void {
    if (this.socket) {
      return;
    }

    const token = this.authService.accessToken();
    if (!token) {
      console.warn('No auth token available');
      return;
    }

    this.socket = io(environment.API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectedSignal.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connectedSignal.set(false);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSignal.set(false);
    }
  }

  on<T = unknown>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback as (data: unknown) => void);
  }

  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (callback) {
      this.socket?.off(event, callback as (data: unknown) => void);
    } else {
      this.socket?.off(event);
    }
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data);
  }
}
