#!/bin/bash

rm /etc/letsencrypt/live/certfolder/*

certbot certonly --webroot -w /var/www/certbot --email $EMAIL -d $DOMAIN --cert-name=certfolder --key-type ecdsa --agree-tos --dry-run