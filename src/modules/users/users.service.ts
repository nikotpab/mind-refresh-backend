import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private collectionName = 'users';

  constructor(private firebaseService: FirebaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.firebaseService.db
      .collection(this.collectionName)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return { ...data, id: snapshot.docs[0].id } as User;
  }

  async create(user: Partial<User>): Promise<User> {
    const docRef = this.firebaseService.db.collection(this.collectionName).doc();
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
    const doc = await this.firebaseService.db
      .collection(this.collectionName)
      .doc(id)
      .get();

    if (!doc.exists) {
      return null;
    }

    return { ...doc.data(), id: doc.id } as User;
  }
}

