# DevSamurai Intern Assignment — Full-stack dashboard

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,typescript,nestjs,prisma,postgresql&perline=6" alt="React, Vite, TypeScript, NestJS, Prisma, PostgreSQL" />
</p>

<p align="center">
  <a href="./frontend/README.md"><strong>Frontend README</strong></a>
  &nbsp;·&nbsp;
  <a href="./backend/README.md"><strong>Backend README</strong></a>
</p>

---

### Overview

A full-stack web app with **sign-up / sign-in (JWT)**, an **authenticated layout** (sidebar + header), and a **dashboard** with KPIs and charts backed by a REST API. Built for a full-stack practice assignment (React + NestJS + PostgreSQL + Prisma).

### Architecture

| Folder | Role |
|--------|------|
| `frontend` | React 19, Vite, Tailwind, ShadCN UI, Redux, TanStack Query |
| `backend` | NestJS 11, Prisma 7, PostgreSQL, JWT + bcrypt |

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 14+ (or a compatible host: Neon, Supabase, Railway, …)
- **npm** (or pnpm/yarn if you keep lockfiles in sync)

### Quick start (local)

#### 1. Clone and install

```bash
git clone <repository-url>
cd DevSamurai-Intern_Assignment

cd backend && npm install
cd ../frontend && npm install
```

#### 2. Database & environment — backend

```bash
cd backend
cp .env.example .env
```

Set `DATABASE_URL` and `JWT_SECRET` in `backend/.env`. Apply the schema and (optionally) seed demo chart data:

```bash
npx prisma migrate deploy
npm run db:seed
```

During first-time development you may use `npx prisma migrate dev` to create migrations; for production prefer `migrate deploy`.

#### 3. Environment — frontend

```bash
cd frontend
cp .env.example .env
```

Set `VITE_API_URL` to the API base URL **without** a trailing slash, e.g.:

```env
VITE_API_URL=http://localhost:3000
```

#### 4. Run both apps

**Terminal 1 — API**

```bash
cd backend
npm run start:dev
```

Default: `http://localhost:3000` (or `PORT` from `.env`).

**Terminal 2 — SPA**

```bash
cd frontend
npm run dev
```

Default Vite dev server: `http://localhost:5173`

#### 5. Quick checks

- Sign up: `POST /auth/signup`
- Sign in: `POST /auth/login`
- Profile (Bearer JWT): `GET /me`
- Dashboard: `GET /dashboard/overview` (JWT required)
- UI flow: `/auth/sign-up` → `/auth/sign-in` → `/dashboard`.

### REST API (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | No | Create user; returns user + JWT |
| `POST` | `/auth/login` | No | Login; returns user + JWT |
| `GET` | `/me` | JWT | Current user profile |
| `GET` | `/dashboard/overview` | JWT | KPIs + chart series |
| `POST` | `/dashboard/demo-seed` | JWT | Regenerate demo stats (only when env flag enabled; see Production) |

### Production & deployment

#### Build

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build
```

The frontend production bundle is in `frontend/dist`; serve it via a static host/CDN or reverse proxy.

#### CORS

`backend/src/main.ts` allows `http://localhost:5173`, `http://localhost:3001`, and any origin whose hostname contains `.vercel.app`. If the frontend is on another domain (Railway, Netlify, custom), **add that origin** to `allowedOrigins` or drive it from environment variables (`FRONTEND_URL`, etc.).

#### Demo data reset on the server

`POST /dashboard/demo-seed` overwrites demo statistics tables. It is **disabled by default** so logged-in users cannot reset data. Enable only when needed:

```env
ENABLE_DASHBOARD_DEMO_SEED=true
```

Turn it off after use, or enable only on staging.

#### Production environment variables

| Variable | App | Notes |
|----------|-----|-------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Long random secret; never commit |
| `PORT` | Backend | Host-specific (often set by Railway/Render) |
| `ENABLE_DASHBOARD_DEMO_SEED` | Backend | `true` only when API seeding is required |
| `VITE_API_URL` | Frontend (build time) | Public API URL |


### Directory layout (abbreviated)

```
├── backend/
│   ├── prisma/           # schema, migrations, seed
│   ├── src/
│   │   ├── auth/         # signup, login, JWT, /me
│   │   ├── dashboard/    # overview + demo-seed (flag)
│   │   └── prisma/
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── README.md
└── README.md
```

Frontend details: [`frontend/README.md`](./frontend/README.md).

### Assumptions & trade-offs

- **Access JWT only** — no refresh tokens; enough for the assignment; longer sessions would need refresh tokens or httpOnly cookies.
- **Passwords** hashed with bcrypt; **tokens** in `localStorage` — simple for SPAs; stricter production setups often mitigate XSS + cookies.
- **Prisma schema** uses conventional PostgreSQL-style names (`user`, `passwordhash`, …) — semantically equivalent to “passwordHash / createdAt” in the brief.
- **Demo seed via API** is gated by an env flag so it is not open in production by default.

### Extras in the repo

Prisma migrations + seed; TanStack Query on the dashboard; `data-testid` on key pages/buttons; partial unit tests (NestJS).

### License

Private / per assignment terms (`UNLICENSED` in `backend/package.json`).

---

### Tổng quan

Ứng dụng web full-stack: **đăng ký / đăng nhập (JWT)**, **layout đã đăng nhập** (sidebar + header), **dashboard** với KPI và biểu đồ lấy dữ liệu từ API. Làm theo bài tập thực hành full-stack (React + NestJS + PostgreSQL + Prisma).

### Kiến trúc

| Thư mục | Vai trò |
|--------|---------|
| `frontend` | React 19, Vite, Tailwind, ShadCN UI, Redux, TanStack Query |
| `backend` | NestJS 11, Prisma 7, PostgreSQL, JWT + bcrypt |

### Yêu cầu môi trường

- **Node.js** 20+ (khuyến nghị LTS)
- **PostgreSQL** 14+ (hoặc host tương thích: Neon, Supabase, Railway, …)
- **npm** (hoặc pnpm/yarn nếu bạn tự đồng bộ lockfile)

### Cài đặt nhanh (local)

#### 1. Clone và cài dependency

```bash
git clone <repository-url>
cd DevSamurai-Intern_Assignment

cd backend && npm install
cd ../frontend && npm install
```

#### 2. Database và biến môi trường — backend

```bash
cd backend
cp .env.example .env
```

Chỉnh `DATABASE_URL` và `JWT_SECRET` trong `backend/.env`. Áp dụng schema và (tuỳ chọn) seed dữ liệu demo cho biểu đồ:

```bash
npx prisma migrate deploy
npm run db:seed
```

Lần đầu phát triển có thể dùng `npx prisma migrate dev` để tạo migration mới; production nên dùng `migrate deploy`.

#### 3. Biến môi trường — frontend

```bash
cd frontend
cp .env.example .env
```

Đặt `VITE_API_URL` trỏ tới base URL API **không có** `/` cuối, ví dụ:

```env
VITE_API_URL=http://localhost:3000
```

#### 4. Chạy song song

**Terminal 1 — API**

```bash
cd backend
npm run start:dev
```

Mặc định: `http://localhost:3000` (hoặc `PORT` trong `.env`).

**Terminal 2 — SPA**

```bash
cd frontend
npm run dev
```

Mặc định Vite: `http://localhost:5173`

#### 5. Kiểm tra nhanh

- Đăng ký: `POST /auth/signup`
- Đăng nhập: `POST /auth/login`
- Profile (Bearer JWT): `GET /me`
- Dashboard: `GET /dashboard/overview` (cần JWT)
- Luồng UI: `/auth/sign-up` → `/auth/sign-in` → `/dashboard`.

### API REST (tóm tắt)

| Phương thức | Đường dẫn | Auth | Mô tả |
|-------------|-----------|------|--------|
| `POST` | `/auth/signup` | Không | Tạo user, trả user + JWT |
| `POST` | `/auth/login` | Không | Đăng nhập, trả user + JWT |
| `GET` | `/me` | JWT | Thông tin user hiện tại |
| `GET` | `/dashboard/overview` | JWT | KPI + chuỗi dữ liệu biểu đồ |
| `POST` | `/dashboard/demo-seed` | JWT | Tạo lại dữ liệu demo (chỉ khi bật flag, xem mục Production) |

### Production và triển khai

#### Build

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build
```

Static build của frontend nằm trong `frontend/dist`; phục vụ qua CDN/host tĩnh hoặc reverse proxy.

#### CORS

`backend/src/main.ts` cho phép `http://localhost:5173`, `http://localhost:3001`, và mọi origin có hostname chứa `.vercel.app`. Nếu deploy frontend lên domain khác (Railway, Netlify, custom domain), **cần thêm origin đó** vào `allowedOrigins` hoặc cấu hình qua biến môi trường (`FRONTEND_URL`, …).

#### Tạo lại dữ liệu demo trên server

Endpoint `POST /dashboard/demo-seed` ghi đè bảng thống kê demo. **Mặc định tắt** để tránh user đã đăng nhập reset DB. Bật khi cần:

```env
ENABLE_DASHBOARD_DEMO_SEED=true
```

Sau khi dùng xong nên tắt lại hoặc chỉ bật trên staging.

#### Biến môi trường production (checklist)

| Biến | Ứng dụng | Ghi chú |
|------|-----------|---------|
| `DATABASE_URL` | Backend | Chuỗi PostgreSQL |
| `JWT_SECRET` | Backend | Chuỗi dài, ngẫu nhiên, không commit |
| `PORT` | Backend | Tuỳ host (Railway/Render thường set sẵn) |
| `ENABLE_DASHBOARD_DEMO_SEED` | Backend | `true` chỉ khi cần seed qua API |
| `VITE_API_URL` | Frontend (build time) | URL công khai của API |


### Cấu trúc thư mục (rút gọn)

```
├── backend/
│   ├── prisma/           # schema, migrations, seed
│   ├── src/
│   │   ├── auth/         # signup, login, JWT, /me
│   │   ├── dashboard/    # overview + demo-seed (flag)
│   │   └── prisma/
│   └── test/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── README.md
└── README.md
```

Tài liệu từng package: [`frontend/README.md`](./frontend/README.md) · [`backend/README.md`](./backend/README.md).

### Giả định & trade-off

- **Chỉ access JWT**, không refresh token — đủ cho bài tập; session dài hơn cần refresh flow hoặc cookie httpOnly.
- **Mật khẩu user**: bcrypt; token lưu `localStorage` — đơn giản cho SPA; production cứng hơn thường cân nhắc XSS + cookie.
- **Schema Prisma** dùng tên bảng/cột kiểu PostgreSQL (`user`, `passwordhash`, …) — tương đương về dữ liệu với “passwordHash / createdAt” trong đề.
- **Demo seed qua API** có cờ env để không mở trên production mặc định.

### Bonus trong repo

Prisma migrations + seed; TanStack Query cho dashboard; `data-testid` trên một số nút/trang; unit test một phần (NestJS).

### License

Private / theo quy định assignment (`UNLICENSED` ở `backend/package.json`).
