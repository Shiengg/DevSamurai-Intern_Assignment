import { api } from '@/lib/axios'

export interface DashboardKpis {
  emailsSent: number
  emailsSentChangePct: number
  deliveryRate: number
  deliveryRateChangePct: number
  subscribers: number
  subscribersChangePct: number
  bounceRate: number
  bounceRateChangePct: number
}

export interface DashboardEmailSentPoint {
  date: string
  value: number
  transactional?: number
  marketing?: number
}

export interface DashboardPerformancePoint {
  date: string
  openRate: number
  clickRate: number
}

export interface DashboardPerformanceSummary {
  avgOpenRate: number
  avgOpenRateChange: number
  avgClickRate: number
  avgClickRateChange: number
}

export interface GetDashboardResponse {
  kpis: DashboardKpis
  emailSentSeries: DashboardEmailSentPoint[]
  performanceSeries: DashboardPerformancePoint[]
  summary: DashboardPerformanceSummary
}

export async function getDashboardOverview(params?: {
  from?: string
  to?: string
  limit?: number
}): Promise<GetDashboardResponse> {
  const { data } = await api.get<GetDashboardResponse>('/dashboard/overview', { params })
  return data
}

export async function postDashboardDemoSeed(): Promise<{ ok: true; daysSeeded: number }> {
  const { data } = await api.post<{ ok: true; daysSeeded: number }>('/dashboard/demo-seed')
  return data
}
