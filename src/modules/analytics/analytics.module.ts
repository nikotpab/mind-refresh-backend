import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MoodsModule } from '../moods/moods.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MoodsModule, AuthModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
