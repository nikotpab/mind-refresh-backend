import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationRepository } from './notification.repository';
import { FirebaseModule } from '../../common/firebase.module';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    UsersModule,
  ],
  providers: [NotificationsService, NotificationsGateway, NotificationRepository],
  controllers: [NotificationsController],
  exports: [NotificationsService, NotificationRepository],
})
export class NotificationsModule {}
