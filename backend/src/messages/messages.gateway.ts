import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { MessagesService } from './messages.service.js';
import type { PublicUser } from '../users/user.presenter.js';

interface AuthenticatedSocket extends Socket {
  user?: PublicUser;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        socket.disconnect();
        return;
      }

      (socket as AuthenticatedSocket).user = {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        username: "",
        id: user.id,
        email: user.email
      };

      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(socket.id);

      console.log(`User ${user.email} connected`);
    } catch (error) {
      console.error('Connection error:', error);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket): void {
    const user = socket.user;
    if (user) {
      const sockets = this.userSockets.get(user.id);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.userSockets.delete(user.id);
        }
      }
      console.log(`User ${user.email} disconnected`);
    }
  }

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    socket: AuthenticatedSocket,
    data: { channelId: string },
  ): Promise<void> {
    if (!socket.user) {
      return;
    }

    const room = `channel:${data.channelId}`;
    socket.join(room);
    console.log(`User ${socket.user.email} joined channel ${data.channelId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    socket: AuthenticatedSocket,
    data: { channelId: string; content: string },
  ): Promise<void> {
    if (!socket.user) {
      return;
    }

    try {
      const message = await this.messagesService.create(socket.user.id, data.channelId, {
        content: data.content,
      });

      const room = `channel:${data.channelId}`;
      this.server.to(room).emit(`message:${data.channelId}`, message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
}
