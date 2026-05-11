import { Injectable } from '@nestjs/common';
import { MoodsService } from '../moods/moods.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private moodsService: MoodsService,
    private usersService: UsersService
  ) {}

  async getTeamMoodAnalytics() {
    // Analytics needs all records for accurate calculations
    const [moods, users] = await Promise.all([
      this.moodsService.findAll(10000),
      this.usersService.findAll(10000)
    ]);

    const userMap = new Map(users.map(u => [u.id, u]));
    
    const summary = {
      sentiment_very_dissatisfied: 0,
      sentiment_dissatisfied: 0,
      sentiment_neutral: 0,
      sentiment_satisfied: 0,
      sentiment_very_satisfied: 0,
    };

    const emotionValues = {
      sentiment_very_dissatisfied: 1,
      sentiment_dissatisfied: 2,
      sentiment_neutral: 3,
      sentiment_satisfied: 4,
      sentiment_very_satisfied: 5,
    };

    const departmentMoods: Record<string, { total: number, count: number }> = {};

    moods.forEach(mood => {
      if (summary[mood.emotion] !== undefined) {
        summary[mood.emotion]++;
      }

      const user = userMap.get(mood.userId);
      if (user && user.department) {
        if (!departmentMoods[user.department]) {
          departmentMoods[user.department] = { total: 0, count: 0 };
        }
        const value = emotionValues[mood.emotion] || 3;
        departmentMoods[user.department].total += value;
        departmentMoods[user.department].count++;
      }
    });

    const departmentMoodHeatmap: Record<string, number> = {};
    Object.keys(departmentMoods).forEach(dept => {
      departmentMoodHeatmap[dept] = parseFloat((departmentMoods[dept].total / departmentMoods[dept].count).toFixed(1));
    });

    // Provide recommendation based on lowest mood
    const departments = Object.keys(departmentMoodHeatmap);
    let recommendedDepartment = null;
    if (departments.length > 0) {
      recommendedDepartment = departments.reduce((prev, curr) => 
        departmentMoodHeatmap[prev] < departmentMoodHeatmap[curr] ? prev : curr
      );
    }

    return {
      totalRecords: moods.length,
      summary,
      participationRate: users.length > 0 ? Math.round((new Set(moods.map(m => m.userId)).size / users.length) * 100) : 0,
      talentEfficiency: {
        current: 55,
        target: 70
      },
      departmentMoodHeatmap,
      recommendation: recommendedDepartment ? {
        department: recommendedDepartment,
        reason: `El departamento de ${recommendedDepartment} presenta el índice de bienestar más bajo (${departmentMoodHeatmap[recommendedDepartment]}).`
      } : null
    };
  }
}

