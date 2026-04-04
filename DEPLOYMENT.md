# 🚀 Vercel Deployment Guide

Follow these 4 simple steps to take **RSGrills** live!

## 1. Push to GitHub
If you haven't already, you'll need to put your project on GitHub:
1. Create a new repository on [GitHub](https://github.com/new).
2. Follow the instructions to push your local code there:
   ```bash
   git remote add origin https://github.com/your-username/rsgrills.git
   git branch -M main
   git push -u origin main
   ```

## 2. Connect to Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Find your `rsgrills` repository and click **"Import"**.

## 3. Configure Environment Variables (VITAL) ⚠️
During the Import process, you will see an **"Environment Variables"** section. You **MUST** add the following keys for the site to work:

| Key | Value (Copy from below) |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://eekcnnnfhyjanmjvvbop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVla2Nubm5maHlqYW5tanZ2Ym9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDA3OTEsImV4cCI6MjA5MDg3Njc5MX0.kXw5zk7aPwPKXYI82CsL-zlaG2tFYIZGD92szGTX53c` |
| `ADMIN_EMAIL` | `admin@rsgrills.com` |
| `ADMIN_PASSWORD` | `123456` |

> [!TIP]
> Just copy these exact values into the Vercel dashboard fields!

## 4. Deploy!
Click the **"Deploy"** button. Vercel will build your project and give you a live URL in about 2-3 minutes.

---
> [!NOTE]
> **Automatic Updates**: From now on, whenever you push a change to your GitHub repo, Vercel will automatically update your live website!
