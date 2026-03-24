import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetDashboardQueryDto } from './dto/dashboard-query.dto';
import {
  DashboardEmailSentPointDto,
  DashboardPerformancePointDto,
  DashboardPerformanceSummaryDto,
  GetDashboardResponseDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async getDashboard(query: GetDashboardQueryDto): Promise<GetDashboardResponseDto> {
    const latestMetric = await this.prisma.dashboard_metric.findFirst({
      orderBy: { date: 'desc' },
    });

    const seriesRows = await this.prisma.email_daily_stat.findMany({
      where: this.buildEmailDailyWhere(query),
      orderBy: { date: 'asc' },
      ...(query.from || query.to ? {} : { take: query.limit ?? 30 }),
    });

    const emailSentSeries: DashboardEmailSentPointDto[] = seriesRows.map((row) => ({
      date: row.date.toISOString(),
      value: row.transactional + row.marketing,
    }));

    const performanceSeries: DashboardPerformancePointDto[] = seriesRows.map((row) => ({
      date: row.date.toISOString(),
      openRate: this.roundRate(row.open_rate),
      clickRate: this.roundRate(row.click_rate),
    }));

    return {
      kpis: {
        emailsSent: latestMetric?.emails_sent ?? 0,
        emailsSentChangePct: latestMetric?.emails_sent_change_pct ?? 0,
        deliveryRate: latestMetric ? this.roundRate(latestMetric.delivery_rate) : 0,
        deliveryRateChangePct: latestMetric?.delivery_rate_change_pct ?? 0,
        subscribers: latestMetric?.subscribers ?? 0,
        subscribersChangePct: latestMetric?.subscribers_change_pct ?? 0,
        bounceRate: latestMetric ? this.roundRate(latestMetric.bounce_rate) : 0,
        bounceRateChangePct: latestMetric?.bounce_rate_change_pct ?? 0,
      },
      emailSentSeries,
      performanceSeries,
      summary: this.buildPerformanceSummary(performanceSeries),
    };
  }

  private buildEmailDailyWhere(query: GetDashboardQueryDto): Prisma.email_daily_statWhereInput | undefined {
    const hasRange = Boolean(query.from || query.to);
    if (!hasRange) {
      return undefined;
    }

    return {
      date: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined,
      },
    };
  }

  private buildPerformanceSummary(
    performanceSeries: DashboardPerformancePointDto[],
  ): DashboardPerformanceSummaryDto {
    if (performanceSeries.length === 0) {
      return {
        avgOpenRate: 0,
        avgOpenRateChange: 0,
        avgClickRate: 0,
        avgClickRateChange: 0,
      };
    }

    const openRateSum = performanceSeries.reduce((sum, point) => sum + point.openRate, 0);
    const clickRateSum = performanceSeries.reduce((sum, point) => sum + point.clickRate, 0);

    const avgOpenRate = this.roundRate(openRateSum / performanceSeries.length);
    const avgClickRate = this.roundRate(clickRateSum / performanceSeries.length);

    const first = performanceSeries[0];
    const last = performanceSeries[performanceSeries.length - 1];

    return {
      avgOpenRate,
      avgOpenRateChange: this.roundRate(last.openRate - first.openRate),
      avgClickRate,
      avgClickRateChange: this.roundRate(last.clickRate - first.clickRate),
    };
  }

  private roundRate(value: number): number {
    return Number(value.toFixed(1));
  }
}
