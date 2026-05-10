import { Injectable } from '@nestjs/common';
import { MoodsService } from '../moods/moods.service';

@Injectable()
export class AnalyticsService {
  constructor(private moodsService: MoodsService) {}

  async getTeamMoodAnalytics() {
    const moods = await this.moodsService.findAll();
    
    const summary = {
      sentiment_very_dissatisfied: 0,
      sentiment_dissatisfied: 0,
      sentiment_neutral: 0,
      sentiment_satisfied: 0,
      sentiment_very_satisfied: 0,
    };

    moods.forEach(mood => {
      if (summary[mood.emotion] !== undefined) {
        summary[mood.emotion]++;
      }
    });

    return {
      totalRecords: moods.length,
      summary
    };
  }
}
