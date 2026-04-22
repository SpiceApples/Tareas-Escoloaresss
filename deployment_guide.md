# Deployment Guide: Vercel & Railway

I have prepared your code for production. Follow these steps to get your app live and fix the Google login.

## Step 1: Railway (The Database)
1.  Go to your **Railway Dashboard**.
2.  Click on your **PostgreSQL** database.
3.  Go to the **Connect** tab.
4.  Copy the **"Public Connection String"** (it starts with `postgresql://...`).

## Step 2: Vercel (The Hosting)
1.  Go to [Vercel.com](https://vercel.com) and create a **New Project**.
2.  Import your GitHub Repository (the `backend` folder).
3.  **Environment Variables**: In the "Environment Variables" section, add these:
    - `DATABASE_URL`: (Paste the Railway Connection String here).
    - `JWT_SECRET`: (Type something random and secret).
    - `GOOGLE_CLIENT_ID`: `811564986134-8rgc04t2r94tcrulo4gm167cr2u32s07.apps.googleusercontent.com`
    - `NODE_ENV`: `production`
4.  **Click Deploy!**

## Step 3: Google Cloud Console (The Login Fix)
Once Vercel gives you your new link (e.g., `https://tareas-escolares.vercel.app`), you must update Google:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Click on your **OAuth 2.0 Client ID**.
3.  Add the new Vercel link to **Authorized JavaScript origins**.
4.  Add the new Vercel link to **Authorized redirect URIs**.
5.  Click **SAVE**.

## Step 4: Your New "Mobile Link"
You can now open the Vercel link on your phone!
- No more "Origin Mismatch" errors.
- No more tunnels needed.
- The app is live 24/7.

> [!IMPORTANT]
> If you are using GitHub, you need to **push your changes** (`git add .`, `git commit`, `git push`) for Vercel to see the new `vercel.json` and the code fixes I made.
