export class DashboardKpisDto {
  emailsSent: number;
  emailsSentChangePct: number;
  deliveryRate: number;
  deliveryRateChangePct: number;
  subscribers: number;
  subscribersChangePct: number;
  bounceRate: number;
  bounceRateChangePct: number;
}

export class DashboardEmailSentPointDto {
  date: string;
  value: number;
  transactional: number;
  marketing: number;
}

export class DashboardPerformancePointDto {
  date: string;
  openRate: number;
  clickRate: number;
}

export class DashboardPerformanceSummaryDto {
  avgOpenRate: number;
  avgOpenRateChange: number;
  avgClickRate: number;
  avgClickRateChange: number;
}

export class GetDashboardResponseDto {
  kpis: DashboardKpisDto;
  emailSentSeries: DashboardEmailSentPointDto[];
  performanceSeries: DashboardPerformancePointDto[];
  summary: DashboardPerformanceSummaryDto;
}

export type DashboardResponse = GetDashboardResponseDto;
