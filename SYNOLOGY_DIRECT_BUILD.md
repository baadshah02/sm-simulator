# 🚀 Direct Build on Synology NAS Guide
## Smith Manoeuvre Financial Simulator

**This approach builds the Docker image directly on your Synology NAS, avoiding local Docker issues.**

---

## 📋 Prerequisites
- Synology NAS with DSM 7.0+
- Container Manager package installed
- SSH access enabled on your NAS

---

## 📁 Step 1: Transfer Project to NAS

### Option A: File Station Upload (GUI)
1. **Open DSM** → **File Station**
2. **Create folder:** `/docker/projects/`
3. **Upload entire project folder** as `smith-manoeuvre/`
   - Include all files: `src/`, `package.json`, `Dockerfile`, etc.
   - **Tip:** Zip the project folder first, then extract on NAS

### Option B: SCP/SFTP Transfer (Command Line)
```bash
# From your local machine
scp -r /path/to/sm-simulator admin@your-nas-ip:/volume1/docker/projects/smith-manoeuvre/

# Or using rsync
rsync -avz /path/to/sm-simulator/ admin@your-nas-ip:/volume1/docker/projects/smith-manoeuvre/
```

### Option C: Git Clone (if in repository)
```bash
# SSH to NAS first
ssh admin@your-nas-ip
cd /volume1/docker/projects/
git clone https://your-repo-url smith-manoeuvre
```

---

## 🖥️ Step 2: Enable SSH on Synology

1. **DSM** → **Control Panel** → **Terminal & SNMP**
2. **Enable SSH service**
3. **Port:** 22 (default) or custom port
4. **Apply**

---

## 🐳 Step 3: Build on Synology via SSH

### 3.1 SSH to Your NAS
```bash
# From your local machine
ssh admin@your-nas-ip
# Enter your DSM admin password
```

### 3.2 Navigate to Project
```bash
cd /volume1/docker/projects/smith-manoeuvre
ls -la  # Verify all files are present
```

### 3.3 Build Docker Image Directly
```bash
# Build the image on NAS
docker build -t smith-manoeuvre:latest .

# Verify build completed
docker images | grep smith-manoeuvre
```

**Expected Output:**
```
REPOSITORY          TAG       IMAGE ID       CREATED          SIZE
smith-manoeuvre     latest    abc123def456   2 minutes ago    65MB
```

---

## 📦 Step 4: Create Container via SSH

### 4.1 Create Container with Proper Settings
```bash
docker run -d \
  --name smith-manoeuvre-simulator \
  --restart unless-stopped \
  -p 3001:80 \
  smith-manoeuvre:latest
```

### 4.2 Verify Container is Running
```bash
# Check container status
docker ps

# Check logs
docker logs smith-manoeuvre-simulator

# Test locally
curl http://localhost:3001
```

---

## 🌐 Step 5: Configure Reverse Proxy (GUI)

Now follow the reverse proxy setup from `SYNOLOGY_DEPLOYMENT.md`:

1. **DSM** → **Control Panel** → **Login Portal** → **Application Portal**
2. **Create Reverse Proxy Rule:**
   - **Source:** `HTTPS finance.yourdomain.com:443`
   - **Destination:** `HTTP localhost:3001`
3. **Configure SSL Certificate** (Let's Encrypt recommended)

---

## 🔧 Alternative: Use Container Manager GUI

After building via SSH, you can also manage the container through DSM:

### 4.1 View in Container Manager
1. **Container Manager** → **Container** tab
2. Your `smith-manoeuvre-simulator` appears in the list
3. **Manage** via GUI: start, stop, view logs, etc.

### 4.2 Create New Container from Built Image
1. **Container Manager** → **Image** tab  
2. **Select** `smith-manoeuvre:latest`
3. **Launch** with these settings:
   - **Port:** 3001:80
   - **Auto-restart:** Enabled
   - **Environment:** `NODE_ENV=production`

---

## 💡 Benefits of Direct Build on NAS

✅ **No local Docker issues** - Builds directly on target architecture  
✅ **Faster deployment** - No image transfer needed  
✅ **Easier updates** - Just rebuild on NAS  
✅ **Native architecture** - Perfect compatibility  
✅ **Less bandwidth** - Only source code transfer  

---

## 🔄 Future Updates

### Update Process:
```bash
# SSH to NAS
ssh admin@your-nas-ip
cd /volume1/docker/projects/smith-manoeuvre

# Pull/update code (if using Git)
git pull

# Or re-upload changed files via File Station

# Rebuild image
docker build -t smith-manoeuvre:latest .

# Restart container
docker restart smith-manoeuvre-simulator
```

---

## 🆘 Troubleshooting

### Common Issues:

**1. Container Build Fails**
```bash
# Check Docker status on NAS
docker version
docker info

# Free up space if needed
docker system prune -f
```

**2. File Transfer Issues**
```bash
# Verify files transferred correctly
ls -la /volume1/docker/projects/smith-manoeuvre/
cat package.json  # Check file contents
```

**3. Permission Issues**
```bash
# Fix file permissions if needed
sudo chown -R 1000:1000 /volume1/docker/projects/smith-manoeuvre/
```

**4. Container Won't Start**
```bash
# Check detailed logs
docker logs smith-manoeuvre-simulator

# Check port conflicts
netstat -tlnp | grep 3001
```

---

## 🎯 Quick Command Reference

```bash
# SSH to NAS
ssh admin@your-nas-ip

# Navigate to project
cd /volume1/docker/projects/smith-manoeuvre

# Build image
docker build -t smith-manoeuvre:latest .

# Run container
docker run -d --name smith-manoeuvre-simulator --restart unless-stopped -p 3001:80 smith-manoeuvre:latest

# Check status
docker ps
docker logs smith-manoeuvre-simulator

# Test access
curl http://localhost:3001
```

---

## ✅ Success!

Your Smith Manoeuvre Financial Simulator is now:
- **Built directly on Synology** (no architecture issues)
- **Running natively** with optimal performance
- **Accessible locally** via `http://nas-ip:3001`
- **Ready for reverse proxy** setup for external access

This approach is often more reliable than building locally and transferring images! 🎉
