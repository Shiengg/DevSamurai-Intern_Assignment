-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_metric" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "emails_sent" INTEGER NOT NULL,
    "delivery_rate" DOUBLE PRECISION NOT NULL,
    "subscribers" INTEGER NOT NULL,
    "bounce_rate" DOUBLE PRECISION NOT NULL,
    "emails_sent_change_pct" DOUBLE PRECISION NOT NULL,
    "delivery_rate_change_pct" DOUBLE PRECISION NOT NULL,
    "subscribers_change_pct" DOUBLE PRECISION NOT NULL,
    "bounce_rate_change_pct" DOUBLE PRECISION NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_daily_stat" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "transactional" INTEGER NOT NULL,
    "marketing" INTEGER NOT NULL,
    "performance" DOUBLE PRECISION NOT NULL,
    "open_rate" DOUBLE PRECISION NOT NULL,
    "click_rate" DOUBLE PRECISION NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_daily_stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_metric_date_key" ON "dashboard_metric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "email_daily_stat_date_key" ON "email_daily_stat"("date");
