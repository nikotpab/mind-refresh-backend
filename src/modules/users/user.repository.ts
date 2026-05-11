import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
  private readonly collection = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

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

  async findAll(limitParam: number = 20, lastId?: string): Promise<User[]> {
    let query = this.firebaseService.db
      .collection(this.collection)
      .orderBy('email', 'asc')
      .limit(limitParam);

    if (lastId) {
      const lastDoc = await this.firebaseService.db.collection(this.collection).doc(lastId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
      
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.firebaseService.db.collection(this.collection).doc(id).update(data);
  }
}
