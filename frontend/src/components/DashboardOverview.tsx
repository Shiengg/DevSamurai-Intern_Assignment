import { useId, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

import { useIsDarkMode } from '@/hooks/use-is-dark-mode'
import { useIsMobile } from '@/hooks/use-mobile'
import { getDashboardOverview } from '@/services/dashboardService'
import { cn } from '@/lib/utils'

type DashboardChartPalette = {
  spark: {
    line: string
    grid: string
    axis: string
    cursor: string
    dot: string
    dotStroke: string
    tooltipAccent: string
  }
  area: {
    grid: string
    axis: string
    transactional: { stroke: string; gTop: number; gBot: number }
    marketing: { stroke: string; gTop: number; gBot: number }
  }
  bar: {
    grid: string
    axis: string
    open: string
    click: string
    cursor: string
  }
}

function getDashboardChartPalette(isDark: boolean): DashboardChartPalette {
  if (isDark) {
    return {
      spark: {
        line: '#3b82f6',
        grid: 'rgba(255,255,255,0.06)',
        axis: '#a1a1aa',
        cursor: 'rgba(255,255,255,0.12)',
        dot: '#3b82f6',
        dotStroke: '#09090b',
        tooltipAccent: '#3b82f6',
      },
      area: {
        grid: 'rgba(255,255,255,0.06)',
        axis: '#a1a1aa',
        transactional: { stroke: '#22c55e', gTop: 0.32, gBot: 0.04 },
        marketing: { stroke: '#3b82f6', gTop: 0.35, gBot: 0.05 },
      },
      bar: {
        grid: 'rgba(255,255,255,0.06)',
        axis: '#a1a1aa',
        open: '#2563eb',
        click: '#10b981',
        cursor: 'rgba(255,255,255,0.08)',
      },
    }
  }
  return {
    spark: {
      line: '#f97316',
      grid: '#f3f4f6',
      axis: '#9ca3af',
      cursor: '#e5e7eb',
      dot: '#f97316',
      dotStroke: '#ffffff',
      tooltipAccent: '#f97316',
    },
    area: {
      grid: '#f3f4f6',
      axis: '#9ca3af',
      transactional: { stroke: '#0d9488', gTop: 0.4, gBot: 0.05 },
      marketing: { stroke: '#ea580c', gTop: 0.45, gBot: 0.05 },
    },
    bar: {
      grid: '#f3f4f6',
      axis: '#9ca3af',
      open: '#f97316',
      click: '#0d9488',
      cursor: 'rgba(148, 163, 184, 0.18)',
    },
  }
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n)}`
}

function fmtAxisDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Enough points for a wavy monotone sparkline (mock uses smooth multi-peak curves). */
const KPI_SPARK_POINTS = 18

function sampleSparkSeries(
  values: number[],
  dates: string[],
  maxPoints = KPI_SPARK_POINTS,
): { label: string; v: number }[] {
  if (!dates.length || !values.length) return []
  const n = values.length
  if (n <= maxPoints) {
    return values.map((v, i) => ({ label: dates[i] ? fmtAxisDate(dates[i]) : '', v }))
  }
  const out: { label: string; v: number }[] = []
  const last = maxPoints - 1
  for (let j = 0; j < maxPoints; j++) {
    const i = Math.round((j * (n - 1)) / last)
    const ii = Math.min(n - 1, Math.max(0, i))
    out.push({ label: fmtAxisDate(dates[ii]), v: values[ii] ?? 0 })
  }
  return out
}

function normalizeEmailStackPoint(p: {
  date: string
  value: number
  transactional?: number
  marketing?: number
}) {
  const value = Number.isFinite(p.value) ? p.value : 0
  let transactional = typeof p.transactional === 'number' ? p.transactional : undefined
  let marketing = typeof p.marketing === 'number' ? p.marketing : undefined
  if (transactional === undefined && marketing === undefined) {
    transactional = Math.max(0, Math.round(value * 0.42))
    marketing = Math.max(0, value - transactional)
  } else if (transactional === undefined) {
    transactional = Math.max(0, value - (marketing ?? 0))
  } else if (marketing === undefined) {
    marketing = Math.max(0, value - transactional)
  }
  return { ...p, value, transactional, marketing }
}

function buildSparkRows(values: number[], dates: string[]) {
  return sampleSparkSeries(values, dates, KPI_SPARK_POINTS)
}

function subscriberSparkFromVolume(
  values: number[],
  dates: string[],
  subscribersKpi: number,
) {
  if (!values.length || !dates.length) return []
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const span = Math.max(1e-9, maxV - minV)
  const shaped = values.map((v, i) => {
    const t = (v - minV) / span
    const wiggle = 1 + 0.1 * Math.sin(i * 0.55) + 0.06 * Math.sin(i * 1.3)
    return subscribersKpi * (0.58 + 0.42 * t) * wiggle
  })
  return sampleSparkSeries(shaped, dates, KPI_SPARK_POINTS)
}

type PerfBarRow = { date?: string; label?: string; openRate?: number; clickRate?: number }
type PerfMetricTab = 'open' | 'click'

function PerfBarTooltip({
  active,
  payload,
  metric,
  swatchColor,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: PerfBarRow }>
  metric: PerfMetricTab
  swatchColor: string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row?.date) return null
  const dateStr = new Date(row.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const v = metric === 'open' ? (row.openRate ?? 0) : (row.clickRate ?? 0)
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left shadow-md dark:border-[#27272a] dark:bg-[#18181b]">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{dateStr}</p>
      <div className="mt-2 flex min-w-[140px] items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: swatchColor }} aria-hidden />
        <span className="text-xs text-gray-500 dark:text-[#a1a1aa]">Performance</span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-gray-900 dark:text-white">{v.toFixed(1)}</span>
      </div>
    </div>
  )
}

function EmailSentStackedTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: ReadonlyArray<{
    name?: string | number
    dataKey?: unknown
    value?: unknown
    color?: string
    payload?: { date?: string }
  }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  const dateStr = row?.date ? new Date(row.date).toLocaleDateString() : ''
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-xs shadow-md dark:border-[#27272a] dark:bg-[#18181b]">
      <p className="mb-1.5 font-semibold text-gray-900 dark:text-white">{dateStr}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((item, i) => {
          const key = String(item.dataKey ?? item.name ?? i)
          const raw = item.value
          const n = typeof raw === 'number' ? raw : Number(raw)
          const display = Number.isFinite(n) ? String(Math.round(n)) : String(raw ?? '')
          const swatch = item.color ?? '#94a3b8'
          const label =
            item.name != null && item.name !== ''
              ? String(item.name)
              : String(item.dataKey ?? '')
          return (
            <div key={`${key}-${i}`} className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: swatch }} aria-hidden />
              <span className="text-gray-700 capitalize dark:text-[#a1a1aa]">{label}</span>
              <span className="ml-auto font-semibold tabular-nums text-gray-900 dark:text-white">{display}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

type KpiSparkTooltipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ value?: unknown }>
  formatSparkValue: (v: number) => string
  seriesLabel: string
}

function KpiSparkTooltip({
  active,
  payload,
  formatSparkValue,
  seriesLabel,
  accentColor,
}: KpiSparkTooltipProps & { accentColor: string }) {
  if (!active || !payload?.length) return null
  const raw = payload[0]?.value
  const v = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(v)) return null
  return (
    <div className="rounded-full border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-[#27272a] dark:bg-[#18181b]">
      <div className="flex min-w-[128px] items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: accentColor }} aria-hidden />
        <span className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{seriesLabel}</span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
          {formatSparkValue(v)}
        </span>
      </div>
    </div>
  )
}

function KpiCard({
  title,
  subtitle,
  value,
  changePct,
  sparkData,
  formatSparkValue,
  sparkSeriesLabel = 'value',
  sparkPalette,
}: {
  title: string
  subtitle: string
  value: string
  changePct: number
  sparkData: { label: string; v: number }[]
  formatSparkValue: (v: number) => string
  sparkSeriesLabel?: string
  sparkPalette: DashboardChartPalette['spark']
}) {
  const up = changePct >= 0
  const trendCls = up ? 'text-emerald-600 dark:text-[#22c55e]' : 'text-red-500 dark:text-red-400'

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-[#27272a] dark:bg-[#09090b]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-[#a1a1aa]">{subtitle}</p>
        </div>
        <span className={cn('shrink-0 text-xs font-medium', trendCls)}>
          {up ? '↑' : '↓'} {Math.abs(changePct).toFixed(1)}%
        </span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
      <div className="mt-4 h-16 w-full min-w-0">
        {sparkData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`${sparkPalette.line}-${sparkPalette.grid}`}
                data={sparkData}
                margin={{ top: 6, right: 6, left: 0, bottom: 2 }}
              >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={sparkPalette.grid}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: sparkPalette.axis }}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
              />
              <Tooltip
                cursor={{ stroke: sparkPalette.cursor, strokeWidth: 1 }}
                content={(props) => (
                  <KpiSparkTooltip
                    active={props.active}
                    payload={props.payload}
                    formatSparkValue={formatSparkValue}
                    seriesLabel={sparkSeriesLabel}
                    accentColor={sparkPalette.tooltipAccent}
                  />
                )}
              />
              <Line
                type="monotone"
                name={sparkSeriesLabel}
                dataKey="v"
                stroke={sparkPalette.line}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: sparkPalette.dot,
                  stroke: sparkPalette.dotStroke,
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-md bg-gray-50 dark:bg-zinc-900" />
        )}
      </div>
    </div>
  )
}

export default function DashboardOverview() {
  const chartGradId = useId().replace(/:/g, '')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => getDashboardOverview({ limit: 90 }),
  })

  const [perfMetricTab, setPerfMetricTab] = useState<PerfMetricTab>('open')
  const isMobile = useIsMobile()
  const isDark = useIsDarkMode()
  const chartPalette = useMemo(() => getDashboardChartPalette(isDark), [isDark])

  const emailChartData = useMemo(() => {
    if (!data?.emailSentSeries?.length) return []
    return data.emailSentSeries.map((p) => {
      const n = normalizeEmailStackPoint(p)
      return { ...n, label: fmtAxisDate(p.date) }
    })
  }, [data])

  const performanceBarData = useMemo(() => {
    if (!data?.performanceSeries?.length) return []
    return data.performanceSeries.map((p) => ({
      ...p,
      label: fmtAxisDate(p.date),
    }))
  }, [data])

  /** Click rates are ~single-digit %; scaling 0–100 flattens bars — use data-driven ceiling instead. */
  const performanceClickRateYMax = useMemo(() => {
    if (!data?.performanceSeries?.length) return 10
    const max = Math.max(0, ...data.performanceSeries.map((p) => p.clickRate))
    if (!Number.isFinite(max) || max <= 0) return 5
    const padded = Math.max(max * 1.22, max + 0.35)
    return Math.min(100, padded)
  }, [data])

  const sparks = useMemo(() => {
    if (!data) return null
    const dates = data.emailSentSeries.map((p) => p.date)
    const sent = data.emailSentSeries.map((p) => p.value)
    const openRates = data.performanceSeries.map((p) => p.openRate)
    const openDates = data.performanceSeries.map((p) => p.date)

    return {
      sent: buildSparkRows(sent, dates),
      delivery: buildSparkRows(
        openRates.length ? openRates : sent.map(() => data.kpis.deliveryRate),
        openDates.length ? openDates : dates,
      ),
      subs: subscriberSparkFromVolume(sent, dates, data.kpis.subscribers),
      bounce: buildSparkRows(
        (() => {
          const minS = Math.min(...sent)
          const maxS = Math.max(...sent)
          const spanS = Math.max(1e-9, maxS - minS)
          const br = data.kpis.bounceRate
          return sent.map((v, i) => {
            const t = (v - minS) / spanS
            const wiggle = 1 + 0.12 * Math.sin(i * 0.62) + 0.08 * Math.cos(i * 0.38)
            return br * (0.42 + 1.15 * (1 - t)) * wiggle
          })
        })(),
        dates,
      ),
    }
  }, [data])

  const quarterLabel = useMemo(() => {
    if (!data?.emailSentSeries?.length) return ''
    const first = new Date(data.emailSentSeries[0].date)
    const last = new Date(data.emailSentSeries[data.emailSentSeries.length - 1].date)
    const a = first.toLocaleDateString('en-US', { month: 'long' })
    const b = last.toLocaleDateString('en-US', { month: 'long' })
    const y = last.getFullYear()
    return `${a} - ${b} ${y}`
  }, [data])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 p-4 sm:p-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-gray-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-gray-200 dark:bg-zinc-800" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-sm text-red-600 sm:p-6 dark:text-red-400">
        Could not load dashboard data. Please refresh or try again later.
      </div>
    )
  }

  const { kpis } = data

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl md:text-2xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Emails Sent"
          subtitle="Total emails delivered"
          value={formatCompact(kpis.emailsSent)}
          changePct={kpis.emailsSentChangePct}
          sparkData={sparks?.sent ?? []}
          formatSparkValue={(v) => formatCompact(Math.round(v))}
          sparkPalette={chartPalette.spark}
        />
        <KpiCard
          title="Delivery Rate"
          subtitle="Successfully delivered"
          value={`${kpis.deliveryRate.toFixed(1)}%`}
          changePct={kpis.deliveryRateChangePct}
          sparkData={sparks?.delivery ?? []}
          formatSparkValue={(v) => `${v.toFixed(1)}%`}
          sparkPalette={chartPalette.spark}
        />
        <KpiCard
          title="Subscribers"
          subtitle="Active email list size"
          value={formatCompact(kpis.subscribers)}
          changePct={kpis.subscribersChangePct}
          sparkData={sparks?.subs ?? []}
          formatSparkValue={(v) => formatCompact(Math.round(v))}
          sparkPalette={chartPalette.spark}
        />
        <KpiCard
          title="Bounce Rate"
          subtitle="Failed deliveries"
          value={`${kpis.bounceRate.toFixed(1)}%`}
          changePct={kpis.bounceRateChangePct}
          sparkData={sparks?.bounce ?? []}
          formatSparkValue={(v) => `${v.toFixed(1)}%`}
          sparkPalette={chartPalette.spark}
        />
      </div>

      {/* Stacked area — emails breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-[#27272a] dark:bg-[#09090b]">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Emails Sent</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-[#a1a1aa]">
          Email delivery breakdown for the selected period
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0 sm:mt-6 sm:h-[320px]">
          {emailChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={isDark ? 'd' : 'l'}
                data={emailChartData}
                margin={{ top: 8, right: isMobile ? 4 : 10, left: 0, bottom: isMobile ? 4 : 0 }}
              >
                <defs>
                  <linearGradient id={`area-tx-${chartGradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartPalette.area.transactional.stroke}
                      stopOpacity={chartPalette.area.transactional.gTop}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartPalette.area.transactional.stroke}
                      stopOpacity={chartPalette.area.transactional.gBot}
                    />
                  </linearGradient>
                  <linearGradient id={`area-mk-${chartGradId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={chartPalette.area.marketing.stroke}
                      stopOpacity={chartPalette.area.marketing.gTop}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartPalette.area.marketing.stroke}
                      stopOpacity={chartPalette.area.marketing.gBot}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartPalette.area.grid}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: isMobile ? 9 : 11, fill: chartPalette.area.axis }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={isMobile ? 10 : 22}
                />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  content={(props) => (
                    <EmailSentStackedTooltip active={props.active} payload={props.payload} />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="transactional"
                  stackId="1"
                  stroke={chartPalette.area.transactional.stroke}
                  strokeWidth={2}
                  fill={`url(#area-tx-${chartGradId})`}
                />
                <Area
                  type="monotone"
                  dataKey="marketing"
                  stackId="1"
                  stroke={chartPalette.area.marketing.stroke}
                  strokeWidth={2}
                  fill={`url(#area-mk-${chartGradId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">No series data</div>
          )}
        </div>
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm dark:border-[#27272a]">
          <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">

            <span>
              Up {kpis.emailsSentChangePct.toFixed(1)}% from last quarter
            </span>
            <TrendingUp className="size-4 shrink-0 text-emerald-600 dark:text-[#22c55e]" />
          </div>
          {quarterLabel ? (
            <p className="text-xs text-gray-600 dark:text-[#a1a1aa]">{quarterLabel}</p>
          ) : null}
        </div>
      </div>

      {/* Bar — open or click rate (tabs match mock) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-[#27272a] dark:bg-[#09090b]">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 dark:border-[#27272a] md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Email Performance</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#a1a1aa]">
              Open and click rates for the last 3 months
            </p>
          </div>
          <div
            className="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#27272a] dark:bg-[#09090b] md:w-auto"
            role="tablist"
            aria-label="Email performance metric"
          >
            <button
              type="button"
              role="tab"
              aria-selected={perfMetricTab === 'open'}
              onClick={() => setPerfMetricTab('open')}
              className={cn(
                'flex min-h-[4.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-3 text-center transition-colors md:min-w-[7.25rem] md:flex-none',
                perfMetricTab === 'open'
                  ? 'bg-gray-50 dark:bg-[#1c1c1c]'
                  : 'bg-white hover:bg-gray-50/70 dark:bg-[#09090b] dark:hover:bg-[#141414]',
              )}
            >
              <span className="max-w-[4.75rem] text-xs font-medium leading-snug text-gray-500 dark:text-[#9ca3af]">
                Open Rate
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {data.summary.avgOpenRate.toFixed(1)}%
              </span>
            </button>
            <div className="w-px shrink-0 self-stretch bg-gray-200 dark:bg-[#262626]" aria-hidden />
            <button
              type="button"
              role="tab"
              aria-selected={perfMetricTab === 'click'}
              onClick={() => setPerfMetricTab('click')}
              className={cn(
                'flex min-h-[4.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-4 py-3 text-center transition-colors md:min-w-[7.25rem] md:flex-none',
                perfMetricTab === 'click'
                  ? 'bg-gray-50 dark:bg-[#1c1c1c]'
                  : 'bg-white hover:bg-gray-50/70 dark:bg-[#09090b] dark:hover:bg-[#141414]',
              )}
            >
              <span className="text-xs font-medium leading-snug text-gray-500 dark:text-[#9ca3af]">
                Click Rate
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {data.summary.avgClickRate.toFixed(1)}%
              </span>
            </button>
          </div>
        </div>
        <div className="mt-4 h-[220px] w-full min-w-0 sm:mt-6 sm:h-[280px]">
          {performanceBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                key={`${perfMetricTab}-${isDark ? 'd' : 'l'}`}
                data={performanceBarData}
                margin={{ top: 8, right: isMobile ? 4 : 8, left: 0, bottom: isMobile ? 2 : 0 }}
                barCategoryGap={isMobile ? '8%' : '12%'}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={chartPalette.bar.grid}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: isMobile ? 9 : 11, fill: chartPalette.bar.axis }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={isMobile ? 8 : 24}
                />
                <YAxis
                  hide
                  domain={
                    perfMetricTab === 'open' ? [0, 100] : [0, performanceClickRateYMax]
                  }
                />
                <Tooltip
                  cursor={{ fill: chartPalette.bar.cursor }}
                  content={(props) => (
                    <PerfBarTooltip
                      active={props.active}
                      payload={props.payload}
                      metric={perfMetricTab}
                      swatchColor={
                        perfMetricTab === 'open' ? chartPalette.bar.open : chartPalette.bar.click
                      }
                    />
                  )}
                />
                <Bar
                  dataKey={perfMetricTab === 'open' ? 'openRate' : 'clickRate'}
                  fill={perfMetricTab === 'open' ? chartPalette.bar.open : chartPalette.bar.click}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">No performance data</div>
          )}
        </div>
      </div>
    </div>
  )
}
