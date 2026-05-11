import { Injectable } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
  constructor(
    private eventRepository: EventRepository,
    private notificationsService: NotificationsService,
    private usersService: UsersService
  ) {}

  async create(data: any) {
    const eventRecord = await this.eventRepository.create({
      title: data.title,
      description: data.description,
      date: data.date,
      facilitator: data.facilitator || null,
      resources: data.resources || [],
      location: data.location || 'Virtual',
      targetDepartment: data.targetDepartment || null,
      createdBy: data.createdBy,
    });

    // Notify users about the general event or targeted department event (Async and Parallel)
    this.usersService.findAll().then(users => {
      const notifications = users
        .filter(user => user.id !== data.createdBy)
        .filter(user => !data.targetDepartment || user.department === data.targetDepartment)
        .map(user => this.notificationsService.create(user.id, {
          title: 'Nuevo Evento: ' + data.title,
          message: 'Se ha publicado un nuevo evento que podría interesarte.',
          type: 'EVENT_GENERAL'
        }).catch(e => console.error(`Error notifying user ${user.id}:`, e)));
      
      return Promise.all(notifications);
    }).then(() => console.log(`[EventsService] All notifications for event "${data.title}" processed.`))
      .catch(err => console.error('[EventsService] Error in background notifications:', err));

    return eventRecord;
  }

  async invite(eventId: string, email: string, senderName: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Evento no encontrado');
    
    const finalSenderName = (senderName && senderName !== 'undefined') ? senderName : 'Un compañero';
    
    return this.notificationsService.createByEmail(email, {
      title: 'Has sido invitado a un evento',
      message: `${finalSenderName} te ha invitado al evento: ${event.title}`,
      type: 'EVENT_INVITATION',
      senderName: finalSenderName
    });
  }

  async findAll(limit: number = 20, lastId?: string) {
    const events = await this.eventRepository.findAll(limit, lastId);
    
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
    const event = await this.eventRepository.findById(eventId);
    
    if (!event) {
      console.warn('Event not found:', eventId);
      throw new Error('Evento no encontrado');
    }

    const participants = event.participants || [];

    if (participants.includes(userId)) {
      console.log('User already enrolled:', userId);
      return { message: 'Ya estás inscrito en este evento', alreadyEnrolled: true };
    }

    participants.push(userId);
    await this.eventRepository.update(eventId, { participants });
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
    await this.eventRepository.update(id, data);
    return { id, ...data };
  }

  async delete(id: string) {
    await this.eventRepository.delete(id);
    return { id };
  }
}
