import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../common/firebase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
  private collection = 'events';

  constructor(
    private firebaseService: FirebaseService,
    private notificationsService: NotificationsService,
    private usersService: UsersService
  ) {}

  async create(data: any) {
    const docRef = this.firebaseService.db.collection(this.collection).doc();
    const eventRecord = {
      id: docRef.id,
      title: data.title,
      description: data.description,
      date: data.date,
      facilitator: data.facilitator || null,
      targetDepartment: data.targetDepartment || null,
      createdBy: data.createdBy,
      createdAt: new Date(),
    };
    await docRef.set(eventRecord);

    // Notify users about the general event or targeted department event
    const users = await this.usersService.findAll();
    for (const user of users) {
      if (user.id !== data.createdBy) {
        // If targetDepartment is specified, only notify users in that department
        if (!data.targetDepartment || user.department === data.targetDepartment) {
          await this.notificationsService.create(user.id, {
            title: 'Nuevo Evento: ' + data.title,
            message: 'Se ha publicado un nuevo evento que podría interesarte.',
            type: 'EVENT_GENERAL'
          });
        }
      }
    }

    return eventRecord;
  }

  async invite(eventId: string, email: string, senderName: string) {
    const eventDoc = await this.firebaseService.db.collection(this.collection).doc(eventId).get();
    const event = eventDoc.data();
    
    return this.notificationsService.createByEmail(email, {
      title: 'Has sido invitado a un evento',
      message: `${senderName} te ha invitado al evento: ${event.title}`,
      type: 'EVENT_INVITATION',
      senderName
    });
  }

  async findAll() {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .get();
      
    return snapshot.docs.map(doc => doc.data());
  }

  async update(id: string, data: any) {
    await this.firebaseService.db.collection(this.collection).doc(id).update(data);
    return { id, ...data };
  }

  async delete(id: string) {
    await this.firebaseService.db.collection(this.collection).doc(id).delete();
    return { id };
  }
}
