# 🚀 NAS Deployment Guide - Smith Manoeuvre Financial Simulator

## Overview
Deploy your Smith Manoeuvre Financial Simulator on your NAS using Docker with external access via reverse proxy.

## 📋 Prerequisites
- NAS with Docker support (Synology, QNAP, Unraid, etc.)
- Domain name pointing to your external IP
- Port forwarding configured (80/443)
- Reverse proxy solution (Traefik, Nginx Proxy Manager, or Cloudflare)

## 🔧 Quick Deployment

### 1. Clone/Upload Project to NAS
```bash
# SSH into your NAS or use File Station
cd /volume1/docker/projects/  # Adjust path for your NAS
git clone <your-repo> smith-manoeuvre
cd smith-manoeuvre
```

### 2. Build and Deploy
```bash
# Create webproxy network if it doesn't exist
docker network create webproxy

# Build and start the container
docker-compose up -d --build
```

### 3. Access Locally
- **Local access:** `http://your-nas-ip:3001`
- **Container logs:** `docker-compose logs -f`

## 🌐 Reverse Proxy Configuration

### Option 1: Nginx Proxy Manager (Recommended for beginners)

1. **Add Proxy Host in NPM:**
   - Domain Names: `finance.yourdomain.com`
   - Forward Hostname/IP: `smith-manoeuvre-simulator` (container name)
   - Forward Port: `80`
   - Enable SSL with Let's Encrypt

2. **Advanced Settings:**
   ```nginx
   # Add to Custom Nginx Configuration
   client_max_body_size 10M;
   proxy_buffering off;
   proxy_request_buffering off;
   ```

### Option 2: Traefik (Advanced)

Already configured in docker-compose.yml labels. Ensure Traefik is running and:

```yaml
# traefik.yml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

### Option 3: Cloudflare Tunnel (Zero-config external access)

```bash
# Install cloudflared on NAS
docker run -d \
  --name cloudflared-smith \
  --restart unless-stopped \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN
```

## 🔒 Security Recommendations

### 1. Environment Variables
```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
DOMAIN=finance.yourdomain.com
CONTAINER_NAME=smith-manoeuvre-simulator
HOST_PORT=3001
EOF
```

### 2. Firewall Rules
```bash
# Only allow reverse proxy traffic (if using dedicated reverse proxy)
# Block direct port 3001 access from internet
iptables -A INPUT -p tcp --dport 3001 -s 172.18.0.0/16 -j ACCEPT  # Docker network
iptables -A INPUT -p tcp --dport 3001 -j DROP  # Block external access
```

### 3. Basic Authentication (Optional)
Add to nginx config:
```nginx
auth_basic "Smith Manoeuvre Calculator";
auth_basic_user_file /etc/nginx/.htpasswd;
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check container health
docker ps
docker-compose logs smith-manoeuvre-app

# Health endpoint
curl http://localhost:3001
```

### Automatic Updates
```bash
# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
cd /volume1/docker/projects/smith-manoeuvre
git pull
docker-compose down
docker-compose up -d --build
docker system prune -f
EOF
chmod +x update.sh
```

## 🌍 Access URLs

After deployment, access your calculator:
- **Local:** `http://nas-ip:3001`
- **External:** `https://finance.yourdomain.com`
- **Docker logs:** `docker-compose logs -f`

## 🔧 Customization

### Custom Domain in docker-compose.yml
```yaml
labels:
  - "traefik.http.routers.smith-manoeuvre.rule=Host(`your-custom-domain.com`)"
  # or for NPM
  - "npm.host=your-custom-domain.com"
```

### Performance Optimization
```yaml
# Add to docker-compose.yml service
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 128M
      cpus: '0.1'
```

## 📱 Mobile Access
The app is fully responsive and works perfectly on:
- Mobile browsers (iOS Safari, Android Chrome)
- Tablet browsers
- Desktop browsers
- PWA installation supported

## 🆘 Troubleshooting

### Common Issues:
1. **Port 3001 in use:** Change `HOST_PORT` in docker-compose.yml
2. **SSL certificate issues:** Verify domain DNS and port forwarding
3. **Container won't start:** Check logs with `docker-compose logs`
4. **External access blocked:** Verify firewall/router port forwarding

### Debug Commands:
```bash
# Test container internally
docker exec -it smith-manoeuvre-simulator wget -O- http://localhost:80

# Check network connectivity
docker network ls
docker network inspect webproxy
```

## 💡 Tips
- **Backup:** Regular backups of container volumes and configuration
- **SSL:** Always use HTTPS for external access (financial data)
- **Updates:** Monitor for React/dependency security updates
- **Performance:** Consider CDN (Cloudflare) for faster global access

Your Smith Manoeuvre Financial Simulator is now ready for professional NAS deployment! 🎉
