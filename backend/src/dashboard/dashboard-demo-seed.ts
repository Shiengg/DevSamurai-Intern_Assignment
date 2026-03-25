import type { PrismaClient } from '@prisma/client';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function fract(n: number): number {
  return n - Math.floor(n);
}

function hashNoise(i: number, seed: number): number {
  return fract(Math.sin(i * 127.1 + seed * 311.7) * 43758.5453123);
}

function volatilityMix(i: number): number {
  return (
    Math.sin(i * 0.38) * 1 +
    Math.sin(i * 0.095) * 0.9 +
    Math.sin(i * 0.022) * 0.55 +
    Math.cos(i * 0.31) * 0.35 +
    (hashNoise(i, 0) - 0.5) * 1.35 +
    (hashNoise(i, 1) - 0.5) * 0.75 +
    (i % 14 === 0 ? 0.62 : 0) +
    (i % 21 === 7 ? -0.58 : 0) +
    (i % 11 === 4 ? 0.42 : 0) +
    (i % 17 === 11 ? -0.38 : 0)
  );
}

function dayRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Replaces `email_daily_stat` and `dashboard_metric` with the same volatile demo
 * series used by `prisma db seed`.
 */
export async function seedDashboardDemoData(prisma: PrismaClient): Promise<void> {
  const start = new Date('2025-10-01');
  const end = new Date('2025-12-15');
  const dates = dayRange(start, end);
  const n = dates.length;

  await prisma.email_daily_stat.deleteMany();
  await prisma.dashboard_metric.deleteMany();

  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const dow = date.getUTCDay();
    const weekendFactor = dow === 0 || dow === 6 ? 0.78 : 1.06;

    const mix = volatilityMix(i);
    const mixT = volatilityMix(i + 3);
    const mixM = volatilityMix(i + 7);

    const transactional = Math.round(
      clamp(
        (220 + mixT * 155 + Math.sin(i * 0.52) * 85 + (hashNoise(i, 2) - 0.5) * 70) * weekendFactor,
        95,
        720,
      ),
    );
    const marketing = Math.round(
      clamp(
        (280 + mixM * 175 + Math.cos(i * 0.44) * 95 + (hashNoise(i, 3) - 0.5) * 90) *
          (weekendFactor * 0.92 + 0.08),
        120,
        820,
      ),
    );

    const emailsSent = transactional + marketing;

    const openMix = volatilityMix(i + 4);
    const open_rate = clamp(
      30 +
        openMix * 14 +
        (hashNoise(i, 4) - 0.5) * 10 +
        (i % 13 === 0 ? 8 : 0) +
        (i % 16 === 5 ? -9 : 0),
      17,
      56,
    );

    const clickMix = volatilityMix(i + 11);
    const click_rate = clamp(
      3.1 +
        clickMix * 2.4 +
        (hashNoise(i, 5) - 0.5) * 1.8 +
        (i % 15 === 2 ? 1.6 : 0) +
        (i % 12 === 8 ? -1.1 : 0),
      1.1,
      8.9,
    );

    const performance = clamp(open_rate * 0.42 + click_rate * 2.1, 12, 48);

    const deliveryRate = clamp(
      96.4 + volatilityMix(i + 2) * 2.2 + (hashNoise(i, 6) - 0.5) * 0.9,
      93.2,
      99.6,
    );
    const bounceRate = clamp(
      2.1 - mix * 0.95 + (hashNoise(i, 7) - 0.5) * 0.55 + Math.sin(i * 0.17) * 0.35,
      0.12,
      5.2,
    );
    const subscribers = Math.round(
      clamp(2650 + i * 18 + volatilityMix(i + 1) * 140 + (hashNoise(i, 8) - 0.5) * 80, 2200, 5200),
    );

    const progress = n > 1 ? i / (n - 1) : 0;

    await prisma.email_daily_stat.create({
      data: {
        date,
        transactional,
        marketing,
        performance: Number(performance.toFixed(1)),
        open_rate: Number(open_rate.toFixed(1)),
        click_rate: Number(click_rate.toFixed(1)),
      },
    });

    await prisma.dashboard_metric.create({
      data: {
        date,
        emails_sent: emailsSent,
        delivery_rate: Number(deliveryRate.toFixed(1)),
        subscribers,
        bounce_rate: Number(bounceRate.toFixed(1)),
        emails_sent_change_pct: Number(
          (-6 + volatilityMix(i + 5) * 14 + progress * 22 + (hashNoise(i, 9) - 0.5) * 6).toFixed(1),
        ),
        delivery_rate_change_pct: Number(
          (-2 + volatilityMix(i + 6) * 3.5 + (hashNoise(i, 10) - 0.5) * 2).toFixed(1),
        ),
        subscribers_change_pct: Number(
          (-4 + volatilityMix(i + 8) * 10 + progress * 18 + (hashNoise(i, 11) - 0.5) * 5).toFixed(1),
        ),
        bounce_rate_change_pct: Number(
          (volatilityMix(i + 9) * 3.2 + (hashNoise(i, 12) - 0.5) * 1.8).toFixed(1),
        ),
      },
    });
  }
}
