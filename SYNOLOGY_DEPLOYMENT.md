# 🖥️ Synology NAS Complete Deployment Guide
## Smith Manoeuvre Financial Simulator

### 📋 Prerequisites
- Synology NAS with DSM 7.0+
- Container Manager package installed
- Domain name pointing to your external IP
- Router port forwarding (80/443) to Synology

---

## 🚀 Step 1: Build for Synology

```bash
# Run the Synology-optimized build script
./build-for-synology.sh
```

This creates `smith-manoeuvre-synology.tar` (~50-80MB) optimized for Synology's AMD64 architecture.

---

## 📦 Step 2: Upload & Import Docker Image

### 2.1 Upload TAR File
1. **Open DSM** → **File Station**
2. **Navigate** to `/docker/` (create folder if needed)
3. **Upload** `smith-manoeuvre-synology.tar`
4. **Wait** for upload to complete

### 2.2 Import Image in Container Manager
1. **Open Container Manager** from Package Center
2. Go to **Image** tab
3. Click **Add** → **Add from File**
4. **Browse** → Select `/docker/smith-manoeuvre-synology.tar`
5. Click **Select** → **Next** → **Apply**
6. **Wait** for import (image appears in registry)

---

## 🐳 Step 3: Create Container

### 3.1 Launch Container Creation
1. In **Container Manager** → **Image** tab
2. **Select** `smith-manoeuvre:latest` image
3. Click **Launch**
4. **Container Name:** `smith-manoeuvre-simulator`

### 3.2 Configure Container Settings

**General Settings:**
- ✅ **Enable auto-restart**
- ✅ **Enable resource limitation** (optional):
  - CPU: 25% (0.25 cores)
  - Memory: 512 MB

**Port Settings:**
- **Local Port:** `3001` 
- **Container Port:** `80`
- **Type:** TCP

**Environment Variables:** (optional)
```
NODE_ENV=production
```

### 3.3 Advanced Settings
**Network:**
- Use default bridge network

**Health Check:**
- Enabled automatically (built into image)

---

## 🌐 Step 4: Synology Reverse Proxy Setup

### 4.1 Access Application Portal
1. **DSM** → **Control Panel** → **Login Portal** → **Application Portal**
2. Click **Reverse Proxy** tab
3. Click **Create** → **Reverse Proxy Rule**

### 4.2 Configure Reverse Proxy Rule

**General Tab:**
- **Description:** `Smith Manoeuvre Financial Simulator`
- **Source:**
  - Protocol: `HTTPS` ⚠️ (Important for SSL)
  - Hostname: `finance.yourdomain.com`
  - Port: `443`
- **Destination:**
  - Protocol: `HTTP`
  - Hostname: `localhost` (or your NAS IP)
  - Port: `3001`

**Custom Header Tab:** (Add these headers)
```
Header Name: Host
Value: $host

Header Name: X-Real-IP  
Value: $remote_addr

Header Name: X-Forwarded-For
Value: $proxy_add_x_forwarded_for

Header Name: X-Forwarded-Proto
Value: $scheme
```

**Advanced Tab:** (Optional optimizations)
```
Trusted Proxies: (leave empty)
Enable HSTS: ✅ (recommended)
Enable HTTP/2: ✅ (if supported)
```

### 4.3 Save Configuration
- Click **Save**
- Test internal access: `http://synology-ip:3001`

---

## 🔒 Step 5: SSL Certificate Setup

### Option A: Let's Encrypt (Automatic - Recommended)

#### 5.1 Enable Let's Encrypt
1. **Control Panel** → **Security** → **Certificate**
2. Click **Add** → **Add a new certificate**
3. Select **Get a certificate from Let's Encrypt**
4. **Domain name:** `finance.yourdomain.com`
5. **Email:** your-email@domain.com
6. **Subject Alternative Name:** (optional additional domains)

#### 5.2 Configure Certificate
1. Click **Apply** → Wait for validation
2. Go to **Configure** tab
3. **Assign certificate:**
   - Service: `finance.yourdomain.com (Reverse Proxy)`
   - Certificate: `finance.yourdomain.com`
4. Click **OK**

### Option B: Upload Custom Certificate

#### 5.1 Import Certificate
1. **Control Panel** → **Security** → **Certificate**
2. Click **Add** → **Import certificate**
3. Upload your certificate files:
   - **Private Key:** `.key` file
   - **Certificate:** `.crt` or `.pem` file
   - **Intermediate Certificate:** (if applicable)

#### 5.2 Assign Certificate
1. Go to **Configure** tab
2. Assign to reverse proxy rule
3. Click **OK**

---

## 🔧 Step 6: Router Port Forwarding

Configure your router to forward:
- **Port 80** → Synology IP:80 (HTTP redirect)
- **Port 443** → Synology IP:443 (HTTPS)

**Example Router Config:**
```
Service: Smith-Manoeuvre-HTTP
External Port: 80
Internal IP: 192.168.1.100  (your Synology IP)
Internal Port: 80
Protocol: TCP

Service: Smith-Manoeuvre-HTTPS  
External Port: 443
Internal IP: 192.168.1.100
Internal Port: 443
Protocol: TCP
```

---

## 🧪 Step 7: Testing & Verification

### 7.1 Internal Testing
- **Direct Container:** `http://synology-ip:3001`
- **Reverse Proxy:** `https://finance.yourdomain.com` (local network)

### 7.2 External Testing
- **External Access:** `https://finance.yourdomain.com`
- **SSL Check:** Verify green padlock in browser
- **Mobile Test:** Access from mobile network

### 7.3 Health Monitoring
```bash
# SSH to Synology and check container
docker ps
docker logs smith-manoeuvre-simulator
```

---

## 📱 Step 8: Mobile & PWA Setup

### 8.1 Progressive Web App
Your app supports PWA installation:
1. Visit `https://finance.yourdomain.com` on mobile
2. **Add to Home Screen** prompt appears
3. Creates app-like experience

### 8.2 Mobile Optimization
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Touch-friendly** - Drag-and-drop cards work on mobile
- ✅ **Fast loading** - Nginx caching enabled

---

## 🔧 Troubleshooting

### Common Issues:

**1. 502 Bad Gateway**
- Check container is running: `docker ps`
- Verify port mapping (3001:80)
- Check reverse proxy destination

**2. SSL Certificate Error**
- Verify domain DNS points to external IP
- Check Let's Encrypt validation
- Confirm router port forwarding

**3. Container Won't Start**
```bash
# Check container logs
docker logs smith-manoeuvre-simulator
# Restart container
docker restart smith-manoeuvre-simulator
```

**4. External Access Blocked**
- Verify router port forwarding (80/443)
- Check firewall rules
- Confirm DNS propagation: `nslookup finance.yourdomain.com`

### Debug Commands:
```bash
# Test reverse proxy internally
curl -H "Host: finance.yourdomain.com" http://localhost:3001

# Check certificate
openssl s_client -connect finance.yourdomain.com:443

# View container stats  
docker stats smith-manoeuvre-simulator
```

---

## 🎉 Success! 

Your Smith Manoeuvre Financial Simulator is now:
- ✅ **Running** on Synology NAS
- ✅ **Accessible** via `https://finance.yourdomain.com`
- ✅ **Secured** with SSL certificate
- ✅ **Mobile-friendly** with PWA support
- ✅ **Auto-restarting** if container fails

**Access URLs:**
- **External:** `https://finance.yourdomain.com`
- **Internal:** `http://synology-ip:3001` 
- **Container:** Direct Docker access

Enjoy your professional financial planning tool! 🚀💰
