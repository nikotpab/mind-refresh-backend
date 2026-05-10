import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: any;
  private isMock = false;

  onModuleInit() {
    try {
      if (!admin.apps.length) {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-key.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
      }
      this.firestore = admin.firestore();
      console.log('✅ Firebase Admin initialized with real credentials');
    } catch (error) {
      console.error('⚠️ Real Firebase initialization failed. Switching to MOCK mode.');
      console.error(error);
      this.isMock = true;
      this.firestore = this.createMockFirestore();
    }
  }

  get db() {
    return this.firestore;
  }

  private createMockFirestore() {
    // Basic mock implementation for safe fallback
    if (!(global as any).mockFirestoreStorage) {
      (global as any).mockFirestoreStorage = new Map<string, Map<string, any>>();
    }
    const storage = (global as any).mockFirestoreStorage;

    const mockCollection = (colName: string) => {
      if (!storage.has(colName)) storage.set(colName, new Map());
      const col = storage.get(colName);

      return {
        doc: (id?: string) => {
          const docId = id || Math.random().toString(36).substring(7);
          return {
            id: docId,
            get: async () => ({
              exists: col.has(docId),
              id: docId,
              data: () => col.get(docId)
            }),
            set: async (data: any) => {
              col.set(docId, { ...data, id: docId });
            }
          };
        },
        where: (field: string, op: string, value: any) => ({
          limit: (n: number) => ({
            get: async () => {
              const results = Array.from(col.values()).filter((d: any) => d[field] === value).slice(0, n);
              return { empty: results.length === 0, docs: results.map((r: any) => ({ id: r.id, data: () => r })) };
            }
          }),
          get: async () => {
            const results = Array.from(col.values()).filter((d: any) => d[field] === value);
            return { empty: results.length === 0, docs: results.map((r: any) => ({ id: r.id, data: () => r })) };
          },
          orderBy: () => ({
            get: async () => {
               const results = Array.from(col.values()).filter((d: any) => d[field] === value);
               return { empty: results.length === 0, docs: results.map((r: any) => ({ id: r.id, data: () => r })) };
            }
          })
        }),
        get: async () => {
          const results = Array.from(col.values());
          return { empty: results.length === 0, docs: results.map((r: any) => ({ id: r.id, data: () => r })) };
        },
        orderBy: (field: string, direction: string = 'asc') => ({
          get: async () => {
            const results = Array.from(col.values()).sort((a: any, b: any) => {
              if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
              if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
              return 0;
            });
            return { empty: results.length === 0, docs: results.map((r: any) => ({ id: r.id, data: () => r })) };
          }
        })
      };
    };

    return {
      collection: mockCollection
    };
  }
}
