# Lanbel — Premium Korean Skincare & Cosmetics

A production-grade K-beauty e-commerce platform. Products are imported directly
from South Korea to guarantee 100% authenticity; international shipping takes
7–21 business days.

## Tech Stack

| Layer      | Tools                                                                 |
| ---------- | --------------------------------------------------------------------- |
| Framework  | Next.js 15 (App Router), React 19, TypeScript                         |
| Styling    | Tailwind CSS v4, shadcn/ui (new-york), Framer Motion (`motion`)       |
| Data       | TanStack React Query, Axios, React Hook Form, Zod                     |
| Backend    | Route Handlers, Server Actions, Mongoose / MongoDB                    |
| Auth       | JWT (access + refresh) over httpOnly cookies, bcrypt, Google OAuth    |
| Storage    | Cloudinary                                                            |
| Email      | Brevo                                                                 |
| Payments   | Razorpay                                                              |
| Deploy     | Vercel                                                                |

## Getting Started

```bash
cp .env.example .env.local   # fill in your credentials
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – production build
- `npm run start` – run the production build
- `npm run lint` – ESLint
- `npm run typecheck` – TypeScript type-check
- `npm run seed` – seed the database (categories + admin)

## Architecture

```
src/
├── app/                 # App Router routes
│   └── (storefront)/    # Public storefront (navbar + footer shell)
├── components/
│   ├── ui/              # shadcn primitives
│   └── layout/          # navbar, footer, logo, theme toggle
├── lib/                 # env, db, api-response, api-client, site-config, utils
├── models/              # Mongoose schemas
├── services/            # business logic (DB-facing)
├── actions/             # server actions
├── hooks/               # client hooks
├── context/             # React context providers
├── types/               # shared TypeScript types
├── utils/               # framework-agnostic helpers
└── middleware.ts        # security headers + (later) auth guards
```

## Build Status

| Slice                                            | Status |
| ------------------------------------------------ | ------ |
| Foundation (scaffold, design system, shell)      | ✅ Done |
| Landing page + location selector                 | ⏳ Next |
| Database models & services                       | ⏳      |
| Authentication (JWT, Google, email verification) | ⏳      |
| Catalog, cart, checkout, payments                | ⏳      |
| User dashboard & admin panel                     | ⏳      |
```
