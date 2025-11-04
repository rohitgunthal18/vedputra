# 🔑 HOW TO GET YOUR SERVICE ROLE KEY

## The Problem

You're getting this error because the `SUPABASE_SERVICE_ROLE_KEY` is missing:

```
Error: SUPABASE_SERVICE_ROLE_KEY is not configured
```

## ✅ FOLLOW THESE EXACT STEPS

### Step 1: Go to Supabase Dashboard

Click this link (it will open your project settings):
👉 **https://supabase.com/dashboard/project/zaqzyfiiapihjiexplqs/settings/api**

### Step 2: Find the Service Role Key

On that page, you'll see a section called **"Project API keys"**

You'll see these keys:
- ✅ `anon` `public` - This is already in your code
- 🔑 **`service_role`** `secret` - **THIS IS THE ONE YOU NEED!**

### Step 3: Reveal and Copy the Key

1. Find the row that says **`service_role`** with a tag that says **`secret`**
2. Click the **eye icon** (👁️) to reveal the key
3. Click the **copy icon** to copy the entire key
4. The key is VERY LONG (starts with `eyJ...` and is about 300+ characters)

**IMPORTANT:** Make sure you copy the ENTIRE key!

### Step 4: Create/Update .env.local File

1. In your project folder (`C:\Users\rohit\Desktop\vedputra`), create a file called `.env.local`
2. Paste this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zaqzyfiiapihjiexplqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXp5ZmlpYXBpaGppZXhwbHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTYyMTMsImV4cCI6MjA3NzM5MjIxM30.E_aIvn-HEQE2b9d3cNPSs4EeKT0_orDx2wIZqVf655w

# PASTE YOUR SERVICE_ROLE KEY BELOW (the one you copied from Supabase)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... PASTE_YOUR_FULL_KEY_HERE

# JWT Secret (already generated for you)
JWT_SECRET=f914e5098155592f059f54d5e55cac46b92f9a03f745c7e272855425f6953420

# Environment
NODE_ENV=development
```

3. Replace the `PASTE_YOUR_FULL_KEY_HERE` part with the service_role key you copied

### Step 5: Restart Your Server

1. **Stop the server** (press Ctrl+C in the terminal)
2. **Start it again:** `npm run dev`
3. Wait for it to fully start (you should see "Ready in X ms")

### Step 6: Try Logging In

1. Go to: http://localhost:3000/admin/login
2. Enter:
   - Email: `admin@vedputra.in`
   - Password: `4482@AdmiN`
3. Click "Sign In"

**It should work now!** ✅

---

## 🖼️ Visual Guide

**What you'll see on the Supabase page:**

```
Project API keys
┌─────────────────────────────────────────────────┐
│ Name          │ Key                             │
├─────────────────────────────────────────────────┤
│ anon          │ eyJhbGci... [👁️] [📋]         │
│ public        │                                 │
├─────────────────────────────────────────────────┤
│ service_role  │ ••••••••••• [👁️] [📋]         │ ← THIS ONE!
│ secret        │ Click eye to reveal →           │
└─────────────────────────────────────────────────┘
```

Click the **👁️ (eye icon)** next to `service_role` to reveal it, then click **📋 (copy icon)** to copy it.

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER share your service_role key** - it has full database access
2. **NEVER commit it to git** - `.env.local` is already in `.gitignore`
3. **The key is very sensitive** - treat it like a password

---

## ❓ Still Having Issues?

If you still get errors after this:

1. **Check the .env.local file exists** in your project root folder
2. **Make sure you copied the FULL key** (it's about 300+ characters long)
3. **Make sure there are no extra spaces** before or after the key
4. **Restart the server** completely (Ctrl+C, then `npm run dev`)
5. **Check the terminal** for any error messages when the server starts

---

## 🎉 Once It Works

You'll know it's working when:
- ✅ No errors in the terminal when server starts
- ✅ Login page loads without errors
- ✅ You can successfully log in
- ✅ Admin dashboard opens

**The security system is working - it just needs the right credentials!**

