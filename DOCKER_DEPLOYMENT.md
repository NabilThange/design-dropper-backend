# 🐳 Docker Deployment Guide

## Why Docker?

Docker solves all the Playwright/Chromium installation issues because:
- ✅ Uses official Playwright image with ALL system dependencies pre-installed
- ✅ No permission issues (runs as root in container)
- ✅ Consistent environment (works the same everywhere)
- ✅ No manual browser installation needed

## What We Created

### 1. Dockerfile
```dockerfile
FROM mcr.microsoft.com/playwright:v1.57.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g dembrandt
COPY . .
EXPOSE 10000
CMD ["node", "server.js"]
```

Uses Microsoft's official Playwright image which includes:
- Node.js
- Chromium browser
- All system dependencies
- Everything dembrandt needs

### 2. .dockerignore
Excludes unnecessary files from Docker build:
- node_modules (will be installed fresh)
- .git
- Documentation files

### 3. render.yaml
```yaml
env: docker  # Changed from 'node' to 'docker'
dockerfilePath: ./Dockerfile
```

## Deployment Steps

### Step 1: Commit and Push
```bash
cd C:\Users\thang\Downloads\design-dropper\backend
git add .
git commit -m "Switch to Docker deployment with Playwright image"
git push origin main
```

### Step 2: Update Render Settings

**Option A: Render Auto-Detects (Preferred)**
- Render should automatically detect the Dockerfile
- It will switch to Docker environment
- Deploy will start automatically

**Option B: Manual Update (If Needed)**
1. Go to Render dashboard
2. Click on your service
3. Go to "Settings"
4. Under "Environment", change from "Node" to "Docker"
5. Save changes
6. Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Wait for Build (5-10 minutes)
Docker builds take longer than Node builds because:
- Downloads Playwright image (~1GB)
- Installs all dependencies
- But it's cached for future builds!

### Step 4: Verify Deployment

Check logs for:
```
Building Docker image...
Successfully built image
Starting container...
🚀 Design Dropper API running on port 10000
```

### Step 5: Test Extraction
```bash
curl -X POST https://design-dropper-backend.onrender.com/api/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "stripe.com", "options": {}}'
```

Should return design tokens! ✅

## Advantages of Docker Approach

| Feature | Node Environment | Docker Environment |
|---------|------------------|-------------------|
| Playwright setup | ❌ Complex | ✅ Pre-installed |
| System dependencies | ❌ Manual | ✅ Included |
| Permission issues | ❌ Common | ✅ None |
| Consistency | ⚠️ Varies | ✅ Identical |
| Build time | ✅ Fast (2-3 min) | ⚠️ Slower (5-10 min) |
| Reliability | ⚠️ Medium | ✅ High |

## Troubleshooting

### Build Fails
- Check Render logs for specific error
- Verify Dockerfile syntax
- Ensure all files are committed

### Container Won't Start
- Check that PORT environment variable is set to 10000
- Verify server.js uses `process.env.PORT`

### Extraction Still Fails
- Check Render logs for dembrandt errors
- Verify dembrandt is installed globally in container
- Test locally with Docker:
  ```bash
  docker build -t design-dropper .
  docker run -p 10000:10000 design-dropper
  ```

## Local Testing (Optional)

Test Docker build locally before deploying:

```bash
cd backend

# Build image
docker build -t design-dropper-backend .

# Run container
docker run -p 10000:10000 design-dropper-backend

# Test in another terminal
curl http://localhost:10000/health
```

## Expected Timeline

- **First build**: 8-12 minutes (downloads Playwright image)
- **Subsequent builds**: 3-5 minutes (uses cache)
- **First extraction**: 30-60 seconds (cold start)
- **Subsequent extractions**: 10-20 seconds

## Success Indicators

✅ Docker image builds successfully
✅ Container starts without errors
✅ Health endpoint responds
✅ Extraction returns design tokens
✅ No Playwright/Chromium errors in logs

## Next Steps

1. ✅ Dockerfile created
2. ✅ render.yaml updated for Docker
3. ⏳ Commit and push changes
4. ⏳ Wait for Render to build Docker image
5. ⏳ Test extraction
6. ⏳ Success! 🎉

---

**This is the FINAL solution. Docker eliminates all Playwright installation issues!**
