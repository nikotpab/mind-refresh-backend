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

    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return docs;
  }

  async markAsRead(notificationId: string) {
    await this.firebaseService.db
      .collection(this.collection)
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

      const notification = {
        userId: recipient.id,
        title: title,
        message: `${sender?.name || 'Un compañero'} te ha enviado una frase: "${quote}"`,
        type: 'QUOTE_SHARED',
        read: false,
        createdAt: new Date(),
      };

      const docRef = await this.firebaseService.db
        .collection(this.collection)
        .add(notification);

      const finalNotification = { id: docRef.id, ...notification };
      
      // Enviar via Socket.io para actualización en tiempo real
      this.notificationsGateway.sendNotificationToUser(recipient.id, finalNotification);

      return finalNotification;
    } catch (error) {
      console.error('Error in shareQuote:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al procesar el envío de la frase');
    }
  }
}
