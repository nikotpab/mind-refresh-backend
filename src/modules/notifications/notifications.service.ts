import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private collectionName = 'notifications';

  constructor(
    private firebaseService: FirebaseService,
    private notificationsGateway: NotificationsGateway,
    private usersService: UsersService,
  ) {}

  async getNotifications(userId: string) {
    const snapshot = await this.firebaseService.db
      .collection(this.collectionName)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markAsRead(notificationId: string) {
    await this.firebaseService.db
      .collection(this.collectionName)
      .doc(notificationId)
      .update({ read: true });
    return { success: true };
  }

  async shareQuote(senderId: string, email: string, quote: string, title: string) {
    console.log(`Attempting to share quote from ${senderId} to ${email}`);
    try {
      const recipient = await this.usersService.findByEmail(email);
      if (!recipient) {
        console.warn(`Recipient not found for email: ${email}`);
        throw new NotFoundException('Destinatario no encontrado. Verifique el correo.');
      }

      const sender = await this.usersService.findById(senderId);
      console.log(`Found sender: ${sender?.name}, recipient: ${recipient.name}`);

      const notification = {
        userId: recipient.id,
        title: title,
        message: `${sender?.name || 'Un compañero'} te ha enviado una frase: "${quote}"`,
        type: 'QUOTE_SHARED',
        read: false,
        createdAt: new Date(),
      };

      const docRef = await this.firebaseService.db
        .collection(this.collectionName)
        .add(notification);

      console.log(`Notification saved with ID: ${docRef.id}`);

      const finalNotification = { id: docRef.id, ...notification };
      
      // Enviar via Socket.io para actualización en tiempo real
      this.notificationsGateway.sendNotificationToUser(recipient.id, finalNotification);
      console.log(`Notification sent via Socket to user ${recipient.id}`);

      return finalNotification;
    } catch (error) {
      console.error('Error in shareQuote:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al procesar el envío de la frase');
    }
  }
}
