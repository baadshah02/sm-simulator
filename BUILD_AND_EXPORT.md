# 📦 Docker Image Import Guide - Smith Manoeuvre Simulator

## Overview
Skip building on NAS by importing a pre-built Docker image directly.

## 🚀 Method 1: Build Locally & Import to NAS

### 1. Build Image Locally (on your computer)
```bash
# Clone the project
git clone <your-repo> smith-manoeuvre
cd smith-manoeuvre

# Build the Docker image
docker build -t smith-manoeuvre:latest .

# Save image to tar file
docker save smith-manoeuvre:latest > smith-manoeuvre-image.tar
```

### 2. Transfer to NAS
```bash
# Option A: SCP/SFTP upload
scp smith-manoeuvre-image.tar admin@your-nas-ip:/volume1/docker/images/

# Option B: Use NAS web interface File Station to upload the .tar file
```

### 3. Import on NAS
```bash
# SSH into NAS
ssh admin@your-nas-ip

# Load the Docker image
docker load < /volume1/docker/images/smith-manoeuvre-image.tar

# Verify image is loaded
docker images | grep smith-manoeuvre
```

### 4. Deploy with Pre-built Image
Create modified `docker-compose.yml`:
```yaml
version: '3.8'

services:
  smith-manoeuvre-app:
    image: smith-manoeuvre:latest  # Use pre-built image instead of build
    container_name: smith-manoeuvre-simulator
    restart: unless-stopped
    ports:
      - "3001:80"
    networks:
      - webproxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.smith-manoeuvre.rule=Host(`finance.yourdomain.com`)"
      - "traefik.http.routers.smith-manoeuvre.tls=true"
      - "traefik.http.routers.smith-manoeuvre.tls.certresolver=letsencrypt"
    environment:
      - NODE_ENV=production

networks:
  webproxy:
    external: true
```

## 🌐 Method 2: Docker Hub Registry

### 1. Push to Docker Hub (from your computer)
```bash
# Tag for Docker Hub
docker tag smith-manoeuvre:latest yourusername/smith-manoeuvre:latest

# Login and push
docker login
docker push yourusername/smith-manoeuvre:latest
```

### 2. Pull on NAS
```bash
# On NAS
docker pull yourusername/smith-manoeuvre:latest
```

### 3. Use in docker-compose.yml
```yaml
services:
  smith-manoeuvre-app:
    image: yourusername/smith-manoeuvre:latest
    # ... rest of config
```

## 📁 Method 3: NAS-Specific Import

### Synology NAS
1. **Container Manager GUI:**
   - Open Container Manager
   - Go to "Image" tab
   - Click "Add" → "Add from File"
   - Upload your `.tar` file
   - Image appears in registry

2. **Create Container from GUI:**
   - Select imported image
   - Configure ports (3001:80)
   - Add environment variables
   - Start container

### QNAP Container Station
1. **Import Image:**
   - Container Station → Images
   - "Pull" → "Import" 
   - Select your `.tar` file

2. **Create Container:**
   - Use imported image
   - Map port 3001:80
   - Configure network settings

### Unraid
1. **Import via Terminal:**
   ```bash
   # Copy tar to Unraid
   cp smith-manoeuvre-image.tar /mnt/user/appdata/
   
   # Load image
   docker load < /mnt/user/appdata/smith-manoeuvre-image.tar
   ```

2. **Use in Unraid Docker templates or Portainer**

## 🔧 Method 4: Automated Build Script

Create `build-and-deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🏗️  Building Smith Manoeuvre Docker Image..."

# Build image
docker build -t smith-manoeuvre:latest .

# Save image
docker save smith-manoeuvre:latest > smith-manoeuvre-image.tar

echo "📦 Image saved as smith-manoeuvre-image.tar"
echo "💡 Transfer this file to your NAS and run:"
echo "   docker load < smith-manoeuvre-image.tar"
echo "   docker-compose up -d"

# Optional: Automatically upload to NAS if configured
if [ ! -z "$NAS_HOST" ]; then
    echo "📤 Uploading to NAS..."
    scp smith-manoeuvre-image.tar $NAS_USER@$NAS_HOST:/volume1/docker/images/
    echo "✅ Upload complete!"
fi
```

## 💾 Image Size Optimization

Your current image is efficient thanks to multi-stage build:
```dockerfile
# Stage 1: Build (temporary)
FROM node:18-alpine AS build
# ... build process

# Stage 2: Final image (small)
FROM nginx:alpine  # Only ~23MB base
# ... only production files
```

**Expected final image size:** ~50-80MB (very efficient!)

## 🚀 Quick Deploy Commands

```bash
# After importing image to NAS:
cd /volume1/docker/projects/smith-manoeuvre
docker-compose up -d

# Check status
docker ps
docker-compose logs -f
```

## 🔄 Update Process

When you update the app:
1. Build new image locally
2. Export to tar
3. Import to NAS  
4. Restart container: `docker-compose up -d`

## 💡 Advantages of Pre-built Images

- ✅ **Faster deployment** - No build time on NAS
- ✅ **Less NAS resources** - No Node.js/build tools needed
- ✅ **Consistent builds** - Same image everywhere
- ✅ **Easy rollbacks** - Keep multiple image versions
- ✅ **Offline deployment** - Works without internet on NAS

Your Smith Manoeuvre Simulator is now ready for efficient NAS deployment! 🎉
