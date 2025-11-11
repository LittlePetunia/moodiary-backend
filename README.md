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
-- Users (id auto‑generated)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  created_at timestamptz not null default now()
);

-- Moods (FK to users.id)
create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date_iso date not null,
  mood text not null check (mood in ('sad','neutral','happy')),
  note text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mood_entries_user_date_idx
  on public.mood_entries (user_id, date_iso);
```

## Start the Server
```bash
npm run dev
```

## API Endpoints

## User APIs

### Create User (Register)

```
POST http://localhost:4000/api/v1/users
```
body
```json
{
  "display_name": "Qiao",
  "email": "qiao@test.com"
}
```
response
```json
{
    "user": {
        "id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
        "display_name": "Qiao",
        "email": "qiao@test.com",
        "created_at": "2025-11-11T22:27:22.440651+00:00"
    }
}
```

### Get all users 

```
GET http://localhost:4000/api/v1/users
```
response
```json
{
    "users": [
        {
            "id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
            "display_name": "Qiao",
            "email": "qiao@test.com",
            "created_at": "2025-11-11T22:27:22.440651+00:00"
        },
        {
            "id": "caa18a60-0450-4d84-a355-be777c68cbc7",
            "display_name": "Qiao",
            "email": "qiao@example.com",
            "created_at": "2025-11-11T22:17:58.251578+00:00"
        }
    ]
}

---

```
## Mood APIs

### Get all moods for a given user
```
GET http://localhost:4000/api/v1/moods?user_id=bb3afabb-bf64-4b8a-81dc-0fb32e0794f3
```
response
```json
{
    "items": [
        {
            "id": "8fe9bc20-b1d9-4858-89bd-fd51e1edb402",
            "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
            "date_iso": "2025-11-11",
            "mood": "happy",
            "note": "Feeling okk",
            "tags": [
                "gym",
                "sunny"
            ],
            "created_at": "2025-11-11T22:28:17.517923+00:00",
            "updated_at": "2025-11-11T22:28:17.517923+00:00"
        }
    ]
}
```
### Get moods for a given user in a given time range
```
GET http://localhost:4000/api/v1/moods?user_id=bb3afabb-bf64-4b8a-81dc-0fb32e0794f3&from=2025-01-01&to=2025-12-31
```
response
```json
{
    "items": [
        {
            "id": "8fe9bc20-b1d9-4858-89bd-fd51e1edb402",
            "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
            "date_iso": "2025-11-11",
            "mood": "happy",
            "note": "Feeling okk",
            "tags": [
                "gym",
                "sunny"
            ],
            "created_at": "2025-11-11T22:28:17.517923+00:00",
            "updated_at": "2025-11-11T22:28:17.517923+00:00"
        }
    ]
}
```

### Create Mood
```
POST http://localhost:4000/api/v1/moods?user_id=bb3afabb-bf64-4b8a-81dc-0fb32e0794f3
```

body
```json
{
  "date_iso": "2025-11-11",
  "mood": "happy",
  "note": "Feeling okk",
  "tags": ["gym", "sunny"]
}
```
reponse
```json
{
    "item": {
        "id": "8fe9bc20-b1d9-4858-89bd-fd51e1edb402",
        "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
        "date_iso": "2025-11-11",
        "mood": "happy",
        "note": "Feeling okk",
        "tags": [
            "gym",
            "sunny"
        ],
        "created_at": "2025-11-11T22:28:17.517923+00:00",
        "updated_at": "2025-11-11T22:28:17.517923+00:00"
    }
}
```

### Update Mood
```
PUT http://localhost:4000/api/v1/moods/8fe9bc20-b1d9-4858-89bd-fd51e1edb402
```
body
```json
{
  "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
  "note": "Feeling even better today",
  "tags": ["gym", "sunny", "coffee"]
}
```
response
```json
{
    "item": {
        "id": "8fe9bc20-b1d9-4858-89bd-fd51e1edb402",
        "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3",
        "date_iso": "2025-11-11",
        "mood": "happy",
        "note": "Feeling even better today",
        "tags": [
            "gym",
            "sunny",
            "coffee"
        ],
        "created_at": "2025-11-11T22:28:17.517923+00:00",
        "updated_at": "2025-11-11T22:53:31.693+00:00"
    }
}
```

### Delete Mood
```
DELETE http://localhost:4000/api/v1/moods/8fe9bc20-b1d9-4858-89bd-fd51e1edb402
```
body
```json
{
  "user_id": "bb3afabb-bf64-4b8a-81dc-0fb32e0794f3"
}
```
