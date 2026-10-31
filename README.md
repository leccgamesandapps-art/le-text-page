# LE TEXT PAGE

Publish text pages with file attachments, comments, replies and likes.

**Live (Vercel):** https://le-text-page-web-developer-560b.vercel.app  
**Repo:** https://github.com/leccgamesandapps-art/le-text-page

## Project structure

```
le-text-page/
├── index.html
├── start.html
├── main.html
├── dashboard.html
├── create.html
├── pages.html
├── settings.html
├── view.html
├── css/
│   └── style.css
├── js/
│   ├── auth.js
│   ├── data.js
│   └── app.js
└── README.md
```

## Current storage

Client-side (`localStorage`) for rapid prototyping:

| Key | Purpose |
|-----|---------|
| `le_text_users` | Users (Username, Password, UserID) |
| `le_text_user` | Current session |
| `le_text_pages` | TextPages (UserID, TextID, Date, title, content, files, likes) |
| `le_text_comments` | Comments + replies + likes + attachments |

## Production Database (recommended)

**Stack:** Vercel + Supabase (Auth + Postgres) + Vercel Blob (files)

### 1. Create Supabase project
1. Go to https://supabase.com → New project
2. Note Project URL + anon key + service role key

### 2. SQL schema (run in Supabase SQL Editor)

```sql
-- Users are handled by Supabase Auth (auth.users)
-- We store profile extras if needed
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

create table public.text_pages (
  text_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz default now()
);

create table public.page_attachments (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.text_pages(text_id) on delete cascade,
  url text not null,
  name text,
  mime text,
  size bigint,
  created_at timestamptz default now()
);

create table public.comments (
  comment_id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.text_pages(text_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(comment_id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table public.comment_attachments (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(comment_id) on delete cascade,
  url text not null,
  name text,
  mime text,
  size bigint
);

create table public.likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('page', 'comment')),
  target_id uuid not null,
  created_at timestamptz default now(),
  primary key (user_id, target_type, target_id)
);

-- Indexes
create index on public.text_pages (created_at desc);
create index on public.comments (text_id, created_at);
create index on public.likes (target_type, target_id);

-- RLS (basic)
alter table public.profiles enable row level security;
alter table public.text_pages enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.page_attachments enable row level security;
alter table public.comment_attachments enable row level security;

create policy "Public read pages" on public.text_pages for select using (true);
create policy "Users insert own pages" on public.text_pages for insert with check (auth.uid() = user_id);
create policy "Users update own pages" on public.text_pages for update using (auth.uid() = user_id);
create policy "Users delete own pages" on public.text_pages for delete using (auth.uid() = user_id);

create policy "Public read comments" on public.comments for select using (true);
create policy "Auth users insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "Public read likes" on public.likes for select using (true);
create policy "Auth users manage likes" on public.likes for all using (auth.uid() = user_id);
```

### 3. Vercel Blob for files
- Enable Blob store in Vercel project
- Upload from Create / Comment forms → store returned URL in `page_attachments` / `comment_attachments`

### 4. Environment variables (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLOB_READ_WRITE_TOKEN=
```

## Next steps for full backend
1. Convert to Next.js App Router (or keep static + API routes)
2. Replace localStorage calls with Supabase client
3. Use Vercel Blob for all uploads (no size limits in practice for normal use)
4. Redeploy

Made for LE.
