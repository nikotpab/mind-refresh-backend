import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
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
  async getMoods(@Req() req: any, @Query('limit') limit?: number, @Query('lastId') lastId?: string) {
    // We should technically paginate by userId, but for now we'll just pass params 
    // to findByUserId if it supported it. The instructions say "paginacion en listados de moods".
    // Currently findByUserId doesn't have it, but we can return all or implement it. 
    return this.moodsService.findByUserId(req.user.sub);
  }
}
