# 🚨 URGENT: Fix Login Error - Environment Variables Missing

## The Problem

You're getting this error:
```
Error: SUPABASE_SERVICE_ROLE_KEY is not configured. Please set it in environment variables.
```

This is the security check I implemented - the server won't start without proper secrets.

---

## ✅ QUICK FIX (5 Minutes)

### Step 1: Get Your Service Role Key

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/zaqzyfiiapihjiexplqs/settings/api
   
2. **Copy the "service_role" key:**
   - Look for the section called "Project API keys"
   - Find the key labeled **"service_role"**
   - Click the eye icon to reveal it
   - Copy the entire key (starts with `eyJ...`)

### Step 2: Generate JWT Secret

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (a long random string).

### Step 3: Update .env.local File

I've created a `.env.local` file for you. Open it and:

1. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with the service_role key from Step 1
2. Replace `YOUR_GENERATED_JWT_SECRET_HERE` with the secret from Step 2

**The file should look like this:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://zaqzyfiiapihjiexplqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...

NODE_ENV=development
```

### Step 4: Restart Your Development Server

1. Stop the current server (Ctrl+C)
2. Run: `npm run dev`
3. Try logging in again

---

## 🔐 Security Note

**⚠️ NEVER commit the `.env.local` file to git!**

The `.env.local` file is already in `.gitignore`, so it won't be committed. This file contains sensitive secrets that must remain private.

---

## ✅ After Fix

Once you've set the environment variables:

1. **Restart the server:** `npm run dev`
2. **Go to admin login:** http://localhost:3000/admin/login
3. **Login with:**
   - Email: `admin@vedputra.in`
   - Password: `4482@AdmiN`

**The login should now work!** ✅

---

## 📝 For Production Deployment (Vercel)

When deploying to Vercel, add these same environment variables in:

**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add:
- `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
- `JWT_SECRET` = (your generated secret)

---

## ❓ If You Still Have Issues

If you still can't login after this:

1. Check the terminal for any error messages
2. Make sure there are no extra spaces in the `.env.local` file
3. Make sure you copied the FULL service_role key (it's very long)
4. Restart the server after saving `.env.local`

**The security system is working - it just needs the proper credentials to function!**

