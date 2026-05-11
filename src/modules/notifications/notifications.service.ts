import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private collection = 'notifications';

  constructor(
    private firebaseService: FirebaseService,
    private notificationsGateway: NotificationsGateway,
    private usersService: UsersService,
  ) {}

  async getNotifications(userId: string) {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();

    let docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const parseDate = (date: any) => {
      if (!date) return 0;
      if (date.toDate && typeof date.toDate === 'function') return date.toDate().getTime();
      if (date instanceof Date) return date.getTime();
      if (typeof date === 'string' || typeof date === 'number') return new Date(date).getTime();
      if (date.seconds) return date.seconds * 1000;
      return 0;
    };

    docs.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));

    return docs;
  }

  async markAsRead(notificationId: string) {
    await this.firebaseService.db
      .collection(this.collection)
      .doc(notificationId)
      .update({ read: true });
    return { success: true };
  }

  async create(userId: string, data: any) {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const notification = {
      id: docRef.id,
      userId,
      title: data.title,
      message: data.message,
      type: data.type || 'GENERAL',
      read: false,
      createdAt: new Date(),
      senderName: data.senderName || null,
    };
    await docRef.set(notification);

    // Real-time notification
    this.notificationsGateway.sendNotificationToUser(userId, notification);

    return notification;
  }

  async createByEmail(email: string, data: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.create(user.id, data);
  }

  async shareQuote(
    senderId: string,
    email: string,
    quote: string,
    title: string,
  ) {
    console.log(`Attempting to share quote from ${senderId} to ${email}`);
    try {
      const recipient = await this.usersService.findByEmail(email);
      if (!recipient) {
        console.warn(`Recipient not found for email: ${email}`);
        throw new NotFoundException(
          'Destinatario no encontrado. Verifique el correo.',
        );
      }

      const sender = await this.usersService.findById(senderId);
      const docRef = this.firebaseService.db.collection(this.collection).doc();

      const notification = {
        id: docRef.id,
        userId: recipient.id,
        title: title,
        message: `${sender?.name || 'Un compañero'} te ha enviado una frase: "${quote}"`,
        type: 'QUOTE_SHARED',
        read: false,
        createdAt: new Date(),
      };

      await docRef.set(notification);

      // Enviar via Socket.io para actualización en tiempo real
      this.notificationsGateway.sendNotificationToUser(
        recipient.id,
        notification,
      );

      return notification;
    } catch (error) {
      console.error('Error in shareQuote:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Error al procesar el envío de la frase',
      );
    }
  }
}
