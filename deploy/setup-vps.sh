#!/bin/bash
# Setup Mirror en VPS
set -e

# 1. Clonar repo
cd /var/www
git clone https://github.com/JuanjoG92/mirror.git mirror
cd /var/www/mirror

# 2. Configurar Nginx
cat > /etc/nginx/sites-available/mirror << 'EOF'
server {
    listen 80;
    server_name mirror.centralchat.pro;
    root /var/www/mirror;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /.well-known/ {
        add_header Content-Type application/json;
        try_files $uri =404;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /sw.js {
        add_header Cache-Control "no-cache";
    }

    location /manifest.json {
        add_header Cache-Control "no-cache";
        add_header Content-Type "application/manifest+json";
    }
}
EOF

# 3. Activar sitio
ln -sf /etc/nginx/sites-available/mirror /etc/nginx/sites-enabled/mirror

# 4. Verificar y recargar nginx
nginx -t && systemctl reload nginx

# 5. Certificado SSL
certbot --nginx -d mirror.centralchat.pro --non-interactive --agree-tos --email info@centralchat.pro --redirect

echo "✅ Mirror configurado en https://mirror.centralchat.pro"
