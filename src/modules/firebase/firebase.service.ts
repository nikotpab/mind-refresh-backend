import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-key.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    }
    
    this._db = admin.firestore();
  }

  get db() {
    return this._db;
  }
}
