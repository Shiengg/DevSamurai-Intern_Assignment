<p align="center">
  <a href="https://nestjs.com/" target="_blank" rel="noopener noreferrer"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS logo" /></a>
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=typescript,prisma,postgresql&perline=6" alt="TypeScript, Prisma, PostgreSQL" />
</p>

# Backend API

<p align="center"><strong>NestJS</strong> REST API — auth (JWT), dashboard metrics, Prisma + PostgreSQL.</p>

<p align="center">
  <a href="../README.md">Monorepo README</a>
  &nbsp;·&nbsp;
  <a href="../frontend/README.md">Frontend README</a>
</p>


---

### Overview

This package exposes a **REST API** consumed by the SPA: user registration and login with **bcrypt** + **JWT**, profile route **`GET /me`**, and **dashboard** endpoints backed by **Prisma** models (`user`, `dashboard_metric`, `email_daily_stat`).

### Stack

- **NestJS** 11 — modules, guards, validation pipes
- **Prisma** 7 + **PostgreSQL**
- **@nestjs/jwt** + **Passport** (JWT strategy)
- **class-validator** / **class-transformer** for DTOs

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ (or compatible hosted DB)
- **npm**

### Environment variables

Copy the example file and edit values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `PORT` | No | HTTP port (default **3000**) |
| `ENABLE_DASHBOARD_DEMO_SEED` | No | Set to `true` only to allow `POST /dashboard/demo-seed` (regenerates demo chart data) |

### Install & database

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

- First-time local development: you can use `npx prisma migrate dev` to create or apply migrations interactively.
- Production / CI: prefer `prisma migrate deploy`.

### Run

```bash
# development (watch)
npm run start:dev

# production (after npm run build)
npm run start:prod
```

Default URL: `http://localhost:3000` (or your `PORT`).

### REST API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | No | Create user; returns user + JWT |
| `POST` | `/auth/login` | No | Login; returns user + JWT |
| `GET` | `/me` | JWT | Current user (no password hash) |
| `GET` | `/dashboard/overview` | JWT | KPIs + time series for charts |
| `POST` | `/dashboard/demo-seed` | JWT | Reseed demo tables (**only if** `ENABLE_DASHBOARD_DEMO_SEED=true`) |

### Source layout (abbreviated)

```
src/
├── auth/              # signup, login, JWT module, MeController
├── dashboard/         # overview query + demo-seed (env-gated)
├── prisma/            # PrismaService (Pg adapter)
├── common/            # guards, filters, interceptors, auth exceptions
├── app.module.ts
└── main.ts            # bootstrap, CORS
```

### CORS

Configured in `src/main.ts` for local Vite ports and `*.vercel.app`. If your frontend origin changes, update `allowedOrigins` or move origins to env-based config. See the **monorepo README** for deployment notes.


### Useful Prisma commands

```bash
npx prisma studio          # browse data
npx prisma migrate dev     # dev migrations
npx prisma generate        # regenerate client after schema changes
```

---

### Tổng quan

Package này cung cấp **REST API** cho SPA: đăng ký / đăng nhập với **bcrypt** + **JWT**, **`GET /me`**, và **dashboard** qua **Prisma** (bảng `user`, `dashboard_metric`, `email_daily_stat`).

### Stack

- **NestJS** 11 — module, guard, validation pipe
- **Prisma** 7 + **PostgreSQL**
- **@nestjs/jwt** + **Passport** (JWT)
- **class-validator** / **class-transformer** cho DTO

### Yêu cầu

- **Node.js** 20+
- **PostgreSQL** 14+ (hoặc DB host tương thích)
- **npm**

### Biến môi trường

```bash
cp .env.example .env
```

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `DATABASE_URL` | Có | Chuỗi kết nối PostgreSQL |
| `JWT_SECRET` | Có | Ký JWT |
| `PORT` | Không | Cổng HTTP (mặc định **3000**) |
| `ENABLE_DASHBOARD_DEMO_SEED` | Không | `true` thì mới cho `POST /dashboard/demo-seed` (tạo lại dữ liệu demo biểu đồ) |

### Cài đặt & database

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

- Dev lần đầu: có thể dùng `npx prisma migrate dev`.
- Production / CI: nên dùng `prisma migrate deploy`.

### Chạy app

```bash
npm run start:dev
npm run start:prod
```

Mặc định: `http://localhost:3000` (hoặc `PORT` trong `.env`).

### API REST (tóm tắt)

| Phương thức | Đường dẫn | Auth | Mô tả |
|-------------|-----------|------|--------|
| `POST` | `/auth/signup` | Không | Tạo user + JWT |
| `POST` | `/auth/login` | Không | Đăng nhập + JWT |
| `GET` | `/me` | JWT | User hiện tại |
| `GET` | `/dashboard/overview` | JWT | KPI + chuỗi thời gian cho chart |
| `POST` | `/dashboard/demo-seed` | JWT | Seed lại bảng demo (**chỉ khi** `ENABLE_DASHBOARD_DEMO_SEED=true`) |

### Cấu trúc mã (rút gọn)

```
src/
├── auth/
├── dashboard/
├── prisma/
├── common/
├── app.module.ts
└── main.ts
```

### CORS

Cấu hình trong `src/main.ts` (local Vite, `*.vercel.app`). Origin frontend khác thì chỉnh `allowedOrigins` hoặc đưa ra biến môi trường. Chi tiết deploy xem **README monorepo**.


### Lệnh Prisma hữu ích

```bash
npx prisma studio
npx prisma migrate dev
npx prisma generate
```
