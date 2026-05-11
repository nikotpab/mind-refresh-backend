import { Module } from '@nestjs/common';
import { MoodsController } from './moods.controller';
import { MoodsService } from './moods.service';
import { AuthModule } from '../auth/auth.module';
import { MoodRepository } from './mood.repository';
import { FirebaseModule } from '../../common/firebase.module';

@Module({
  imports: [FirebaseModule, AuthModule],
  controllers: [MoodsController],
  providers: [MoodsService, MoodRepository],
  exports: [MoodsService, MoodRepository]
})
export class MoodsModule {}
