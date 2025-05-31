#!/bin/bash

# Цикл, который будет перезапускать Nginx каждые 24 часа
(while true; do
    sleep 24h
    nginx -s reload
done) &
exec /docker-entrypoint.sh "$@"