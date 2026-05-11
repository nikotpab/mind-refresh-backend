import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private collection = 'users';

  constructor(private firebaseService: FirebaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async create(user: Partial<User>): Promise<User> {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const newUser = { 
      ...user,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.set(newUser);
    return newUser as User;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.firebaseService.db.collection(this.collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as User;
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.firebaseService.db.collection(this.collection).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.firebaseService.db.collection(this.collection).doc(id).update(data);
  }

  async toggleSavedEvent(userId: string, eventId: string): Promise<string[]> {
    const userRef = this.firebaseService.db.collection(this.collection).doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return [];
    
    const user = userDoc.data();
    let savedEvents = user.savedEvents || [];
    
    if (savedEvents.includes(eventId)) {
      savedEvents = savedEvents.filter((id: string) => id !== eventId);
    } else {
      savedEvents.push(eventId);
    }
    
    await userRef.update({ savedEvents });
    return savedEvents;
  }
}
