import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { EventRepository } from './event.repository';
import { FirebaseModule } from '../../common/firebase.module';

@Module({
  imports: [FirebaseModule, AuthModule, NotificationsModule, UsersModule],
  controllers: [EventsController],
  providers: [EventsService, EventRepository],
  exports: [EventsService, EventRepository]
})
export class EventsModule {}
