#!/bin/bash

# Цикл, который будет перезапускать Nginx каждые 24 часа
while true; do 
    sleep 24h & wait $${!}
    nginx -s reload
done
&

exec /docker-entrypoint.sh "$@"