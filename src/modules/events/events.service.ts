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
      resources: data.resources || [],
      location: data.location || 'Virtual',
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
    const finalSenderName = (senderName && senderName !== 'undefined') ? senderName : 'Un compañero';
    
    return this.notificationsService.createByEmail(email, {
      title: 'Has sido invitado a un evento',
      message: `${finalSenderName} te ha invitado al evento: ${event.title}`,
      type: 'EVENT_INVITATION',
      senderName: finalSenderName
    });
  }

  async findAll() {
    const snapshot = await this.firebaseService.db
      .collection(this.collection)
      .get();
      
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort by date (newest first)
    events.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return events;
  }

  async enroll(eventId: string, userId: string) {
    console.log(`--- Enrollment attempt: Event ${eventId} for User ${userId} ---`);
    const eventRef = this.firebaseService.db.collection(this.collection).doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      console.warn('Event not found:', eventId);
      throw new Error('Evento no encontrado');
    }

    const event = eventDoc.data();
    const participants = event.participants || [];

    if (participants.includes(userId)) {
      console.log('User already enrolled:', userId);
      return { message: 'Ya estás inscrito en este evento', alreadyEnrolled: true };
    }

    participants.push(userId);
    await eventRef.update({ participants });
    console.log('Firebase updated successfully');

    // Create a notification for the user (async)
    this.notificationsService.create(userId, {
      title: 'Inscripción Exitosa',
      message: `Te has inscrito correctamente al evento: ${event.title}`,
      type: 'EVENT_REGISTRATION'
    }).catch(e => console.error('Silent error sending notification:', e));

    console.log('Enrollment successful, returning response');
    return { message: 'Inscripción exitosa', alreadyEnrolled: false };
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
