#!/bin/bash

CERTS_PATH="/etc/letsencrypt/live/certfolder"
FULLCHAIN="$CERTS_PATH/fullchain.pem"
PRIVKEY="$CERTS_PATH/privkey.pem"
TRUSTED="$CERTS_PATH/chain.pem"

if [ ! -f "$FULLCHAIN" ] || [ ! -f "$PRIVKEY" ] || [ ! -f "$TRUSTED" ]; then
    echo "Generating dummy certs..."
    mkdir -p "$CERTS_PATH"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$PRIVKEY" \
    -out "$FULLCHAIN" \
    -subj "/CN=localhost"

    cp "$FULLCHAIN" "$TRUSTED"
fi

echo "Starting Nginx..."
sudo docker compose up nginx --build -d

echo "Starting Certbot..."
sudo docker compose up certbot --build

echo "Reloading Nginx to apply valid certificates..."
sudo docker compose exec nginx nginx -s reload

CRON_JOB="0 0 */30 * * docker restart certbot"
(crontab -l 2>/dev/null; echo "$CRON_JOB") | sort -u | crontab -
echo "Certificates will be renewed every 30 days."