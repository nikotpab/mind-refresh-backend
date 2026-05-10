import { Controller, Get, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { MoodsService } from '../moods/moods.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly moodsService: MoodsService
  ) {}

  @Get('summary')
  async getSummary(@Req() req: any) {
    try {
      console.log('--- GET /summary called ---');
      console.log('req.user:', req.user);
      const summary = await this.moodsService.getWeeklySummary(req.user.sub);
      console.log('Summary result:', summary);
      return summary;
    } catch (error: any) {
      console.error('Error in getSummary:', error);
      throw new HttpException(error.message || 'Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('team-mood')
  @Roles('Administrador', 'Líder')
  async getTeamMood() {
    return this.analyticsService.getTeamMoodAnalytics();
  }

  @Get('sentiment')
  @Roles('Administrador')
  async getSentiment() {
    return this.analyticsService.getTeamMoodAnalytics();
  }

  @Get('strategic')
  @Roles('Administrador', 'Líder')
  async getStrategic() {
    return this.analyticsService.getTeamMoodAnalytics();
  }
}
