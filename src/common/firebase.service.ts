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

    class MockQuery {
      constructor(private data: any[]) {}

      where(field: string, op: string, value: any) {
        let filtered = this.data;
        if (op === '==') {
          filtered = filtered.filter(d => d[field] === value);
        } else if (op === '>=') {
          filtered = filtered.filter(d => d[field] >= value);
        } else if (op === '<=') {
          filtered = filtered.filter(d => d[field] <= value);
        } else if (op === '>') {
          filtered = filtered.filter(d => d[field] > value);
        } else if (op === '<') {
          filtered = filtered.filter(d => d[field] < value);
        }
        return new MockQuery(filtered);
      }

      orderBy(field: string, direction: string = 'asc') {
        const sorted = [...this.data].sort((a, b) => {
          let valA = a[field];
          let valB = b[field];
          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
          return 0;
        });
        return new MockQuery(sorted);
      }

      limit(n: number) {
        return new MockQuery(this.data.slice(0, n));
      }

      async get() {
        return {
          empty: this.data.length === 0,
          docs: this.data.map(r => ({ id: r.id, data: () => r }))
        };
      }
    }

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
            },
            update: async (data: any) => {
              const existing = col.get(docId) || {};
              col.set(docId, { ...existing, ...data, id: docId });
            },
            delete: async () => {
              col.delete(docId);
            }
          };
        },
        where: (field: string, op: string, value: any) => {
          return new MockQuery(Array.from(col.values())).where(field, op, value);
        },
        orderBy: (field: string, direction: string = 'asc') => {
          return new MockQuery(Array.from(col.values())).orderBy(field, direction);
        },
        limit: (n: number) => {
          return new MockQuery(Array.from(col.values())).limit(n);
        },
        get: async () => {
          return new MockQuery(Array.from(col.values())).get();
        }
      };
    };

    return {
      collection: mockCollection
    };
  }
}
