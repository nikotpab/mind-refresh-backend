import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private collection = 'notifications';

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService
  ) {}

  async findByUserId(userId: string) {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('userId', '==', userId)
      .get();
      
    // Sort in memory to avoid needing a composite index in Firestore for development
    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    docs.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    return docs.slice(0, 20);
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
      senderName: data.senderName || null
    };
    await docRef.set(notification);
    return notification;
  }

  async createByEmail(email: string, data: any) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.create(user.id, data);
  }

  async markAsRead(id: string) {
    await this.firebaseService.db.collection(this.collection).doc(id).update({ read: true });
  }
}
