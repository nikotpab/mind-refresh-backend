import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';

@Injectable()
export class NotificationRepository {
  private readonly collection = 'notifications';

  constructor(private readonly firebaseService: FirebaseService) {}

  async create(data: any): Promise<any> {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const notification = {
      ...data,
      id: docRef.id,
      createdAt: new Date(),
    };
    await docRef.set(notification);
    return notification;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.firebaseService.db
      .collection(this.collection)
      .doc(notificationId)
      .update({ read: true });
  }
}
