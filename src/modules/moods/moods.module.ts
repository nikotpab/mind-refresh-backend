import { Module } from '@nestjs/common';
import { MoodsController } from './moods.controller';
import { MoodsService } from './moods.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MoodsController],
  providers: [MoodsService],
  exports: [MoodsService]
})
export class MoodsModule {}
