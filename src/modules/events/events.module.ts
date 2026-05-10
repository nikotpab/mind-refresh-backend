import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, NotificationsModule, UsersModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}
