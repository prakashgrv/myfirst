# FamilyScheduler

A beautiful, Airbnb-inspired web app for parents to manage their kids' homework and extracurricular schedules.

## Features

- **Register Kids** — Create profiles with name, grade, school, and a color-coded avatar
- **Schedule Management** — Add homework (due date, subject, priority) and activities (time, location, recurring)
- **Per-Kid Views** — Tabbed dashboard per child: Upcoming, Homework, Activities, Completed
- **Household View** — All kids' schedules in one color-coded timeline view
- **Email Reminders** — Automated email reminders before deadlines (via Resend + Vercel Cron)
- **Google Calendar Sync** — Push any schedule item to Google Calendar
- **Google OAuth** — Sign in with Google (no passwords)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Prisma 7 + PostgreSQL (Neon)
- **Auth**: NextAuth.js v5 (Google OAuth)
- **Email**: Resend
- **Calendar**: Google Calendar API
- **Styling**: Tailwind CSS + custom components
- **Hosting**: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | [Neon](https://neon.tech) → create project → copy connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or your Vercel URL (prod) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `RESEND_API_KEY` | [Resend](https://resend.com) → API Keys |
| `CRON_SECRET` | `openssl rand -base64 32` |

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Google Calendar API**
3. Create OAuth 2.0 Credentials (Web Application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to `.env.local`

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploying to Vercel

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Update `NEXTAUTH_URL` to your Vercel domain
5. Add Vercel domain to Google OAuth authorized redirect URIs
6. Deploy!

The `vercel.json` cron job runs every 15 minutes to send email reminders.
