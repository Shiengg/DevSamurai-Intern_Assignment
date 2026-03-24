/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing environment variable DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const prismaSeed = prisma as PrismaClient & {
  dashboard_metric: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown>;
    deleteMany: () => Promise<unknown>;
  };
  email_daily_stat: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    deleteMany: () => Promise<unknown>;
  };
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

async function main() {
  const start = new Date("2025-10-01");
  const end = new Date("2025-12-15");
  const dates = dayRange(start, end);

  await prismaSeed.email_daily_stat.deleteMany();
  await prismaSeed.dashboard_metric.deleteMany();

  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const wave = Math.sin(i * 0.45);
    const wave2 = Math.cos(i * 0.21);

    const transactional = Math.round(290 + wave * 70 + wave2 * 40 + (i % 5) * 7);
    const marketing = Math.round(380 + wave2 * 65 + wave * 45 + (i % 7) * 9);
    const performance = clamp(27 + wave * 3.8 + wave2 * 2.2, 18, 40);

    const deliveryRate = clamp(97.2 + wave2 * 0.8 + wave * 0.4, 94.5, 99.8);
    const bounceRate = clamp(0.7 - wave * 0.25 + (i % 6) * 0.01, 0.1, 2.2);
    const subscribers = Math.round(3200 + i * 11 + wave2 * 60);
    const emailsSent = transactional + marketing;

    await prismaSeed.email_daily_stat.create({
      data: {
        date,
        transactional: Math.max(120, transactional),
        marketing: Math.max(170, marketing),
        performance: Number(performance.toFixed(1)),
        open_rate: Number((35.7 + wave2 * 1.8).toFixed(1)),
        click_rate: Number((3.4 + wave * 0.5).toFixed(1)),
      },
    });

    await prismaSeed.dashboard_metric.create({
      data: {
        date,
        emails_sent: emailsSent,
        delivery_rate: Number(deliveryRate.toFixed(1)),
        subscribers,
        bounce_rate: Number(bounceRate.toFixed(1)),
        emails_sent_change_pct: Number((4 + wave * 8 + (i / dates.length) * 10).toFixed(1)),
        delivery_rate_change_pct: Number((1.2 + wave2 * 1.1).toFixed(1)),
        subscribers_change_pct: Number((3 + (i / dates.length) * 9).toFixed(1)),
        bounce_rate_change_pct: Number((-1.2 + wave * 0.8).toFixed(1)),
      },
    });
  }

  const lastDate = dates[dates.length - 1];

  await prismaSeed.dashboard_metric.update({
    where: { date: lastDate },
    data: {
      emails_sent: 9000,
      delivery_rate: 98.1,
      subscribers: 4000,
      bounce_rate: 0.2,
      emails_sent_change_pct: 18,
      delivery_rate_change_pct: 2.3,
      subscribers_change_pct: 12,
      bounce_rate_change_pct: -0.8,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
