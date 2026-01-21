# Operations Guide

This document contains essential commands for managing the Activity Tracker application, verifying the database, and running tests.

## Docker Commands

### 1. Build and Start Application
Rebuilds the images (useful after changes) and starts the containers in detached mode.
```bash
docker compose up -d --build
```

### 2. View Logs
View logs for all services or specific ones.
```bash
# All services
docker compose logs -f

# Specific service (frontend, backend, db)
docker compose logs -f backend
```

### 3. Stop Application
Stops and removes the containers/networks.
```bash
docker compose down
```

### 4. Execute Command in Container
Access the shell or run specific commands inside a running container.
```bash
# Access Backend Shell
docker compose exec backend sh

# Access Database Shell
docker compose exec db psql -U user -d activity_db
```

## Database Operations (SQL)

To run these, first access the DB shell:
```bash
docker compose exec db psql -U user -d activity_db
```

### 1. Check Tables
```sql
\dt
```

### 2. Users Manual Management
```sql
-- Insert User
INSERT INTO users (full_name) VALUES ('New Person');

-- Soft Delete User (set is_active = false)
UPDATE users SET is_active = false WHERE full_name = 'Person Name';

-- Reactivate User
UPDATE users SET is_active = true WHERE full_name = 'Person Name';

-- Check all users
SELECT * FROM users ORDER BY id;
```

### 3. Products Manual Management
```sql
-- Insert Product
INSERT INTO products (name, description) VALUES ('New System', 'System Description');

-- Soft Delete Product
UPDATE products SET is_active = false WHERE name = 'System Name';
```

### 4. View Activities
```sql
SELECT left(subject, 20) as subj, status, category FROM activities ORDER BY created_at DESC LIMIT 5;
```

## Maintenance Scripts

Run these scripts from the root directory (`/scripts` folder).

### Run Tests
Executes backend and frontend verification tests.
```bash
bash scripts/test.sh
```

### Utility Scripts
- **build.sh**: Helper to build images.
- **run.sh**: Helper to run `docker compose up`.

## Troubleshooting

### "Duplicate Key" Error
If you see `duplicate key value violates unique constraint`, you are trying to insert a record (e.g., User or Product) with a name that already exists. Use `UPDATE` instead or delete the old record.

### "Invalid input syntax for type integer: undefined"
This usually happens in API tests or calls when an ID is missing. Ensure the resource was created successfully before trying to update or delete it using its ID.
