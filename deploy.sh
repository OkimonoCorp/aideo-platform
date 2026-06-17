#!/bin/sh
cd /var/www/aideo_deploy/aideo
docker compose -f docker-compose.prod.yml down
git pull
docker compose -f docker-compose.prod.yml up -d --build