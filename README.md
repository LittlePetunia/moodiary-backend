# Moodiary Backend

This is the backend for the Moodiary mobile app.  
This version removes authentication so the API is easy to test during early development.
All mood data is stored under a single test user ID from the `.env` file.

Once frontend UI is stable, authentication can be added back later.

## Tech Stack
| Layer | Technology |
|------|------------|
| Runtime | Node.js + TypeScript |
| Server | Express |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| Deployment | Local development (later: Render / Railway / Fly.io) |

## Project Setup

### 1. Clone and Install Dependencies
```bash
npm install
```

### 2. Create `.env`
```bash
create .env file
```

Edit `.env`:
```env
SUPABASE_URL=https://umvununldynpmiohljfk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
DEMO_USER_ID=00000000-0000-0000-0000-000000000000
PORT=4000
CORS_ORIGINS=*
```

### 3. Create Database Table (Already created in my account, we will share)

In Supabase → SQL Editor → New Query:
```sql
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  date_iso date not null,
  mood text not null check (mood in ('sad','neutral','happy')),
  note text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mood_entries_user_date_idx on public.mood_entries (user_id, date_iso);
```

## Start the Server
```bash
npm run dev
```

## API Endpoints

### List Moods
```
GET /api/v1/moods
```

### Create Mood
```
POST /api/v1/moods
Content-Type: application/json
```
Example Body:
```json
{
  "date_iso": "2025-11-11",
  "mood": "happy",
  "note": "Feeling good",
  "tags": ["gym", "sunny"]
}
```

### Update Mood
```
PUT /api/v1/moods/:id
```

### Delete Mood
```
DELETE /api/v1/moods/:id
```
