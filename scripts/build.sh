#!/bin/bash
docker-compose build
docker-compose up --build -d
docker-compose exec backend npm test
docker-compose exec frontend npm run test

docker-compose up -d --build db
docker-compose up -d --build backend
docker-compose up -d --build frontend


