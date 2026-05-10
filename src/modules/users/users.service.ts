import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private collection = 'users';

  constructor(private firebaseService: FirebaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .where('email', '==', email)
      .limit(1)
      .get();
      
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async create(user: Partial<User>): Promise<User> {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const newUser = { id: docRef.id, ...user };
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
}
