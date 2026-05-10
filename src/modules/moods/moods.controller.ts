import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { MoodsService } from './moods.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  async createMood(@Body() createMoodDto: any, @Req() req: any) {
    return this.moodsService.create(req.user.sub, createMoodDto);
  }

  @Get()
  async getMoods(@Req() req: any) {
    return this.moodsService.findByUserId(req.user.sub);
  }
}
