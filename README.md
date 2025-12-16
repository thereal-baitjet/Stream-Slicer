# StreamSlicer AI

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini API](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

**StreamSlicer** is a creator economy tool designed to automate the analysis of long-form stream footage. It uses **Google's Gemini 2.5 Flash** model to identify viral, high-energy clips and tracks usage via **Supabase**.

## 🚀 Deployment Guide (Vercel)

This project is optimized for Vercel.

1.  **Fork/Clone** this repository.
2.  **Create a Supabase Project**:
    *   Go to [database.new](https://database.new).
    *   Go to **SQL Editor** and run the schema script provided in the setup.
    *   Go to **Authentication > Providers** and enable Google and GitHub.
3.  **Deploy to Vercel**:
    *   Import your repository.
    *   **IMPORTANT**: Add the following Environment Variables in Vercel:
        *   `API_KEY`: Your Google Gemini API Key.
        *   `SUPABASE_URL`: Found in Supabase Settings > API.
        *   `SUPABASE_ANON_KEY`: Found in Supabase Settings > API.
4.  **Site URL**:
    *   Once deployed, copy your Vercel URL (e.g., `https://streamslicer.vercel.app`).
    *   Go back to **Supabase > Authentication > URL Configuration** and add your Vercel URL to "Site URL" and "Redirect URLs".

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI**: Google Gemini API (`gemini-2.5-flash`)
*   **Backend**: Supabase (PostgreSQL + Auth)

## 📦 Database Schema

Your Supabase project needs these tables (Run in SQL Editor):

```sql
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  credits int default 0,
  is_trial_used boolean default false
);

create table usage_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  cost int,
  details jsonb
);

-- Enable RLS and Policies as per standard setup
```

## 👨‍💻 Credits

**Created by Vibe.**