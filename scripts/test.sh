#!/bin/bash
echo "Running Backend Tests..."
docker compose exec backend npm run test

echo "Running Frontend Tests (Skipping for now as no tests defined yet)..."
# docker compose exec frontend npm run test
