# 🚀 FINAL Deployment Instructions

## What Changed

### 1. package.json
Added `playwright` and `dembrandt` as dependencies:
```json
"dependencies": {
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "dembrandt": "^0.6.1",
  "playwright": "^1.57.0"
}
```

### 2. render.yaml
Simplified build command (no `--with-deps` to avoid permission issues):
```yaml
buildCommand: npm install && npx playwright install chromium
```

### 3. Why This Works
- `npm install` installs dembrandt and playwright
- `npx playwright install chromium` downloads Chromium browser (no system deps needed)
- dembrandt already uses `--no-sandbox` flag in its code
- Render's environment has enough system libraries for basic Chromium

## Deploy Steps

1. **Commit changes**:
   ```bash
   cd C:\Users\thang\Downloads\design-dropper\backend
   git add .
   git commit -m "Fix: Add playwright dependency and simplify build"
   git push origin main
   ```

2. **Wait for Render to deploy** (5-10 minutes)

3. **Check logs** for:
   ```
   Downloading Chromium...
   Chromium downloaded successfully
   Build successful 🎉
   ```

4. **Test extraction**:
   ```bash
   curl -X POST https://design-dropper-backend.onrender.com/api/extract \
     -H "Content-Type: application/json" \
     -d '{"url": "stripe.com", "options": {}}'
   ```

## If It Still Fails

### Option A: Use Docker (Most Reliable)

Create `backend/Dockerfile`:
```dockerfile
FROM node:18

# Install Playwright system dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx playwright install chromium

COPY . .
EXPOSE 10000
CMD ["node", "server.js"]
```

Then in Render dashboard:
1. Go to your service settings
2. Change "Environment" from "Node" to "Docker"
3. Redeploy

### Option B: Use Puppeteer Instead

If Playwright keeps failing, switch to Puppeteer (lighter weight):

1. Update package.json:
   ```json
   "dependencies": {
     "puppeteer": "^21.0.0"
   }
   ```

2. Update extractor.js to use Puppeteer instead of dembrandt

## Expected Timeline

- **Build time**: 3-5 minutes
- **First extraction**: 30-60 seconds (cold start)
- **Subsequent extractions**: 10-20 seconds

## Success Indicators

✅ Build completes without errors
✅ Server starts successfully
✅ Health endpoint responds
✅ Extraction returns design tokens (not errors)

## Current Status

- ✅ Backend code complete
- ✅ Dependencies configured
- ✅ Build command optimized
- ⏳ Waiting for deployment
- ⏳ Waiting for test

**Next: Commit and push to trigger deployment!**
