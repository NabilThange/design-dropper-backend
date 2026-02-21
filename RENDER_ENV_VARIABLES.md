# 🔐 Render Environment Variables Setup

## Environment Variables to Add in Render Dashboard

Go to your Render service → Settings → Environment → Add Environment Variable

### Required Variables (Already in render.yaml)

These are automatically set from render.yaml:

```
NODE_ENV=production
PORT=10000
```

### Optional Variables (Add if needed)

None required! The Docker setup handles everything.

## How to Add Variables in Render Dashboard

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Select Your Service**
   - Click on "design-dropper-backend"

3. **Go to Environment Tab**
   - Click "Environment" in left sidebar

4. **Add Variables**
   - Click "Add Environment Variable"
   - Enter Key and Value
   - Click "Save Changes"

## Current Configuration

### From render.yaml (Automatic)
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 10000
```

These are automatically applied when you deploy.

## For Local Development

Use `.env.local` file:

```bash
PORT=3000
NODE_ENV=development
```

Then run:
```bash
cp .env.local .env
npm start
```

## Summary

**For Render (Production):**
- ✅ No manual environment variables needed
- ✅ Everything is in render.yaml
- ✅ Docker handles all dependencies

**For Local Development:**
- ✅ Use .env.local as template
- ✅ Copy to .env
- ✅ Run npm start

---

**You don't need to add any environment variables manually in Render dashboard!** 

Everything is configured in render.yaml and will be applied automatically when you deploy. 🚀
