import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  handleConnection(client: Socket) {
    try {
      // Parse cookies
      let cookieToken;
      if (client.handshake.headers.cookie) {
        const cookies = client.handshake.headers.cookie.split(';').map(c => c.trim());
        const accessCookie = cookies.find(c => c.startsWith('access_token='));
        if (accessCookie) {
          cookieToken = accessCookie.split('=')[1];
        }
      }

      const authHeader = client.handshake.headers['authorization'];
      const token = cookieToken || client.handshake.auth?.token || (authHeader && authHeader.split(' ')[1]);
      
      if (!token) {
        throw new Error('No token provided');
      }

      const payload = this.jwtService.verify(token);
      
      const userId = payload.sub || payload.id || client.handshake.query.userId;
      
      if (userId) {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(client.id);
        console.log(`User ${userId} connected with socket ${client.id}. Total sockets for user: ${this.userSockets.get(userId).size}`);
      } else {
        throw new Error('Invalid user id in token');
      }
    } catch (err) {
      console.warn(`WebSocket connection failed: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        console.log(`User ${userId} disconnected from socket ${client.id}`);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          console.log(`User ${userId} has no more active sockets`);
        }
        break;
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.size > 0) {
      console.log(`Sending notification to user ${userId} via ${sockets.size} sockets`);
      sockets.forEach(socketId => {
        this.server.to(socketId).emit('notification', notification);
      });
    } else {
      console.warn(`No active sockets found for user ${userId}`);
    }
  }
}
