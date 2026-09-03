# CreatorNest — VPS Deployment Checklist

## What Changes Automatically (No Code Changes Needed)
The login uses `window.location.origin` so the Google OAuth redirect URL
auto-adapts to wherever the site is running. ✅

---

## Step 1: Update `.env.local` on the VPS

Create `.env.local` on your VPS with your real domain:

```bash
NEXT_PUBLIC_SITE_URL=https://creatornest.com        # or http://YOUR_VPS_IP
NEXT_PUBLIC_API_URL=https://creatornest.com/api/v1  # or http://YOUR_VPS_IP:8000/api/v1

NEXT_PUBLIC_SUPABASE_URL=https://bqesdjhpqdwjowdiinyi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_RkTppq4iOQw3O8vtie3XEQ_5Ak387LY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

## Step 2: Add VPS URL to Supabase Redirect URLs

Go to → https://supabase.com/dashboard/project/bqesdjhpqdwjowdiinyi/auth/url-configuration

Under **Redirect URLs**, add:
```
https://creatornest.com/auth/callback
```
(Replace with your actual VPS domain or IP)

Also update the **Site URL** field to:
```
https://creatornest.com
```

---

## Step 3: Update Google Cloud Console

Go to → https://console.cloud.google.com/apis/credentials

Find your OAuth 2.0 Client ID and add to **Authorized redirect URIs**:
```
https://bqesdjhpqdwjowdiinyi.supabase.co/auth/v1/callback
```
(This is already there — Supabase handles Google's redirect internally)

Also add to **Authorized JavaScript origins**:
```
https://creatornest.com
```

---

## Step 4: Build & Run on VPS

```bash
# On your VPS
cd /var/www/creatornest

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2 (keeps running after SSH closes)
npm install -g pm2
pm2 start npm --name "creatornest" -- start
pm2 save
pm2 startup
```

---

## Step 5: Nginx Config (if using Nginx as reverse proxy)

```nginx
server {
    listen 80;
    server_name creatornest.com www.creatornest.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For HTTPS (recommended), use Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d creatornest.com -d www.creatornest.com
```

---

## Summary of What Needs Updating Per Environment

| Setting | Local | VPS |
|---------|-------|-----|
| `.env.local` SITE_URL | `http://localhost:3000` | `https://creatornest.com` |
| Supabase Redirect URL | `http://localhost:3000/auth/callback` | `https://creatornest.com/auth/callback` |
| Supabase Site URL | `http://localhost:3000` | `https://creatornest.com` |
| Code changes | None | None ✅ |
