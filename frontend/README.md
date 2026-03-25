# Frontend — Dashboard & Auth (Vite + React)

<p align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,typescript,tailwindcss,redux&perline=5" alt="React, Vite, TypeScript, Tailwind CSS, Redux" />
</p>

<p align="center">
  <a href="../README.md">Monorepo README</a>
  &nbsp;·&nbsp;
  <a href="../backend/README.md">Backend README</a>
</p>

---

### Overview

SPA in the **DevSamurai Intern Assignment** monorepo: sign-in/sign-up, sidebar layout, dashboard with charts and KPIs. It talks to a separate HTTP API configured via `VITE_API_URL`.

### Stack

- **React 19** + **TypeScript**
- **Vite 8** (dev server & build)
- **Tailwind CSS 4**
- **ShadCN-style UI** (`src/components/ui/*`, Radix)
- **React Router 7**
- **Redux Toolkit** — theme, displayed user, organization name
- **TanStack Query** — server state for dashboard (and related screens)
- **React Hook Form** + **Zod** — auth forms (`AuthForm`)
- **Axios** — HTTP client, JWT on requests, 401 handling

### Requirements

- **Node.js** 20+
- A running API (from this repo’s backend — see root README) if you need login/dashboard data in the browser.

### Setup

```bash
cd frontend
npm install
cp .env.example .env
```

#### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (for API calls) | Base URL for the API, **no** trailing slash. Local example: `http://localhost:3000` |

`VITE_*` values are baked in at **build time**. Set them in CI or your host before `npm run build`.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (usually port 5173) |
| `npm run build` | `tsc -b` + production bundle → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint |

### Routing

| Path | Description |
|------|-------------|
| `/` | Redirect → `/dashboard` |
| `/auth/sign-in` | Sign in |
| `/auth/sign-up` | Sign up |
| `/dashboard` | Dashboard (token check; redirect to sign-in if missing / 401) |

Defined in `src/App.tsx`.

### Source layout

```
src/
├── components/
│   ├── AuthForm.tsx
│   ├── DashboardOverview.tsx
│   ├── Sidebar.tsx
│   ├── CommandMenuDialog.tsx
│   ├── AppHeader.tsx
│   └── ui/
├── pages/
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   └── Dashboard.tsx
├── services/
│   ├── authService.ts
│   └── dashboardService.ts
├── lib/
│   └── axios.ts
├── store/
├── feature/auth/
└── schemas/formSchemas.ts
```

`formSchemas.ts` is used for org and other forms; the auth form’s Zod schema lives inline in `AuthForm`.

### Auth & HTTP (client-side)

- Access token: `localStorage` key **`accessToken`** (set after login via `authService.setToken`).
- The shared `api` client in `lib/axios.ts` sends `Authorization: Bearer <token>`.
- On 401 outside auth pages: token is cleared and the app redirects to `/auth/sign-in`.

### Command menu

User menu → **Command Menu** opens a command palette (navigation shortcuts and optional in-app actions). Anything that depends on server behavior is documented in the **root** README.

### Production build

```bash
npm run build
```

Ship the **`dist/`** folder to your static host. Before building, set `VITE_API_URL` to the public API URL you will use in production (HTTPS in real deployments). End-to-end setup (API URL, hosting two apps together) is in the root README.

### UI testing

`data-testid` is used on key screens and controls (`signin-page`, `signin-btn`, `signup-btn`, `dashboard-page`, `signout-btn`, theme buttons, `create-org-btn`, …) for automation.

### Lint

```bash
npm run lint
```

### Monorepo docs

Backend, database, migrations, seeds, and REST overview: [root `README.md`](../README.md).

---

### Tổng quan

SPA trong monorepo **DevSamurai Intern Assignment**: đăng nhập/đăng ký, sidebar, dashboard biểu đồ và KPI. Gọi API qua `VITE_API_URL`. Phần server/database xem [README gốc](../README.md).

### Stack

- **React 19** + **TypeScript**
- **Vite 8** (dev server & build)
- **Tailwind CSS 4**
- **ShadCN-style UI** (`src/components/ui/*`, Radix)
- **React Router 7**
- **Redux Toolkit** — theme, user hiển thị, tên organization
- **TanStack Query** — state phía server cho dashboard (và màn liên quan)
- **React Hook Form** + **Zod** — form auth (`AuthForm`)
- **Axios** — HTTP client, gắn JWT, xử lý 401

### Yêu cầu

- **Node.js** 20+
- Cần API đang chạy (backend trong cùng repo — xem README gốc) nếu muốn đăng nhập / xem dashboard có dữ liệu.

### Cài đặt

```bash
cd frontend
npm install
cp .env.example .env
```

#### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|--------|
| `VITE_API_URL` | Có (khi gọi API) | Base URL của API, **không** có slash cuối. VD local: `http://localhost:3000` |

Biến `VITE_*` được nhúng lúc **build**. Production: cấu hình trên CI/host trước `npm run build`.

### Scripts

| Lệnh | Mục đích |
|------|----------|
| `npm run dev` | Dev server (thường port 5173) |
| `npm run build` | `tsc -b` + bundle → `dist/` |
| `npm run preview` | Xem thử bản build cục bộ |
| `npm run lint` | ESLint |

### Luồng routing

| Đường dẫn | Mô tả |
|-----------|--------|
| `/` | Redirect → `/dashboard` |
| `/auth/sign-in` | Đăng nhập |
| `/auth/sign-up` | Đăng ký |
| `/dashboard` | Dashboard (kiểm tra token; redirect sign-in nếu thiếu / 401) |

Khai báo trong `src/App.tsx`.

### Cấu trúc mã

```
src/
├── components/
│   ├── AuthForm.tsx
│   ├── DashboardOverview.tsx
│   ├── Sidebar.tsx
│   ├── CommandMenuDialog.tsx
│   ├── AppHeader.tsx
│   └── ui/
├── pages/
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   └── Dashboard.tsx
├── services/
│   ├── authService.ts
│   └── dashboardService.ts
├── lib/
│   └── axios.ts
├── store/
├── feature/auth/
└── schemas/formSchemas.ts
```

`formSchemas.ts` dùng cho org và form khác; schema auth nằm inline trong `AuthForm`.

### Auth & HTTP (phía client)

- Token: `localStorage` **`accessToken`** (sau login qua `authService.setToken`).
- Client `api` trong `lib/axios.ts` gửi `Authorization: Bearer <token>`.
- 401 (ngoài trang auth): xóa token và redirect `/auth/sign-in`.

### Command menu

Menu user → **Command Menu** mở command palette (lối tắt điều hướng và một số thao tác trong app). Chi tiết hành vi phụ thuộc server nằm ở **README gốc**.

### Build production

```bash
npm run build
```

Deploy thư mục **`dist/`**. Trước khi build, đặt `VITE_API_URL` đúng URL API public (production nên HTTPS). Hướng dẫn full-stack (chạy API + deploy cả hai) xem README gốc.

### Kiểm thử UI

Có **`data-testid`** trên vài màn/nút (`signin-page`, `signin-btn`, `signup-btn`, `dashboard-page`, `signout-btn`, theme, `create-org-btn`, …).

### Lint

```bash
npm run lint
```

### Tài liệu monorepo

Backend, database, migrate, seed, REST API: [README ở thư mục gốc](../README.md).
