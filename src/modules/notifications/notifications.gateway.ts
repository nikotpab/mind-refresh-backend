import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      console.log(`User ${userId} connected with socket ${client.id}. Total sockets for user: ${this.userSockets.get(userId).size}`);
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
