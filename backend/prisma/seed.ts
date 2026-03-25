/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedDashboardDemoData } from '../src/dashboard/dashboard-demo-seed';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing environment variable DATABASE_URL');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedDashboardDemoData(prisma);
  console.log(`Seeded volatile email_daily_stat + dashboard_metric (same range as demo API).`);
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
