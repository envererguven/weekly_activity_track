# Activity Tracking System - Operational Guide

This guide covers all operational aspects of the Activity Tracking System, including installation, running, testing, database management, and architecture overview.

## 1. Prerequisites
- Docker & Docker Compose
- Node.js (for local development scripts)

## 2. Quick Start (Run Everything)
To build and start the entire stack (Database, Backend, Frontend):

```bash
docker compose up -d --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- API Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

docker exec activity_tracker_backend cat package.json
docker exec activity_tracker_backend ls -F
docker exec activity_tracker_backend node scripts/seed.js

docker exec activity_tracker_db psql -U user -d activity_db -c "SELECT COUNT(*) FROM activities;"
docker exec activity_tracker_db psql -U user -d activity_db -c "SELECT * FROM activities LIMIT 5;"
docker exec activity_tracker_db psql -U user -d activity_db -c "SELECT EXTRACT(YEAR FROM created_at) as year, COUNT(*) FROM activities GROUP BY year ORDER BY year;"

docker logs activity_tracker_backend

## 3. Database Operations

### 3.1 Access Database CLI
```bash
docker compose exec db psql -U user -d activity_db
```

### 3.2 Reset Database (Seed Data)
Note: This will delete existing data and seed with test data.
```bash
# Generate seed file (optional if not exists)
node backend/scripts/seed_large.js

# Apply seed inside container
docker compose exec backend node scripts/seed_large.js
```

### 3.3 Manual SQL Execution
Execute arbitrary SQL (replace `YOUR_QUERY`):
```bash
docker compose exec db psql -U user -d activity_db -c "SELECT count(*) FROM activities;"
```

## 4. Testing

### 4.1 Automated Tests
Run the project's test suite (verifies filtering, smart week, sorting):
```bash
docker compose exec backend npm test
```
*Includes: `smart_week_test.js`, `ux_verification.js`, `partial_search_test.js`*

### 4.2 Manual API Testing (cURL)
**Create Activity:**
```bash
curl -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1, 
    "product_name": "CRM", 
    "week": "2026-W04", 
    "status": "Devam Eden", 
    "effort": 4, 
    "category": "Ar-Ge" 
  }'
```

**Bulk Import (Admin):**
```bash
curl -F "file=@path/to/data.xlsx" http://localhost:5000/api/admin/import
```

## 5. Deployment & Maintenance

### 5.1 Rebuild Containers
If you modify `package.json` or Dockerfiles:
```bash
docker compose down
docker compose up -d --build
```

### 5.2 Logs
View logs for troubleshooting:
```bash
docker compose logs -f backend
docker compose logs -f frontend
```

## 6. Architecture & Modules
See [architecture.md](./brain/cfac8c1a-3a89-4cf2-ad1a-bd352f8b38c8/architecture.md) for detailed diagrams.

- **Stack**: React, Node.js, PostgreSQL.
- **Key Features**: 
  - Dynamic JSONB storage for weekly updates.
  - "Smart Week" filtering (Current vs Latest).
  - Real-time partial search.
  - Bulk Excel Upload.

## 7. User Guide - Dashboard (Phase 5)

The Dashboard (`/dashboard`) provides advanced analytics:

1.  **Scope Toggle**:
    -   **Takım Geneli**: View aggregate data for the entire team.
    -   **Kişisel Verilerim**: Switch to this mode to see data for a specific user.
    -   **User Selection**: When in Personal mode, use the dropdown to select the target user.
2.  **Charts**:
    -   **Pie Charts**: View distribution of Categories and Statuses.
    -   **Leaderboards**: See Top Users and Top Systems by Effort hours.
    -   **Heatmap**: Visualize busiest days in the timeline.
3.  **AI Summary**:
    -   Enter your Local LLM URL (default: `http://host.docker.internal:11434/api/generate`) and Model (e.g., `llama3`).
    -   Click **Özet Oluştur** to generate a text summary of recent team activities.
