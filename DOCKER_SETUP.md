# 🐳 Docker Setup Guide

This guide explains how to set up the Lobato Tours application on a new machine using Docker.

## Prerequisites

- Docker installed
- Docker Compose installed
- `docker-compose.yml` file from the repository

## Quick Setup

### 1. Pull and Start Services

```bash
# Pull the latest image and start services
docker-compose pull
docker-compose up -d
```

### 2. Initialize Database Schema

The database will be empty. You need to initialize the schema (tables structure):

**Option A: Using the init script (Recommended)**

**On Linux/Mac:**
```bash
# Wait a few seconds for the app to start, then run:
./scripts/init-db.sh
```

**On Windows (PowerShell):**
```powershell
# Wait a few seconds for the app to start, then run:
.\scripts\init-db.ps1

# If you get an execution policy error, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**On Windows (Command Prompt):**
```cmd
# Wait a few seconds for the app to start, then run:
scripts\init-db.bat
```

**Option B: Using curl**
```bash
# Wait for the app to be ready (about 10-15 seconds), then:
curl -X POST http://localhost:3001/api/init-simple
```

**On Windows PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/init-simple" -Method POST
```

**Option C: Using the browser**
1. Open http://localhost:3001/api/init-simple in your browser
2. Use a tool like Postman or curl to send a POST request to that URL

### 3. Verify Setup

```bash
# Check container status
docker-compose ps

# Check application logs
docker-compose logs app

# Test the API
curl http://localhost:3001/api/test-db
```

## Default Credentials

After initialization, you'll have a default admin user:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **Important:** Change these credentials in production!

## Access Points

- **Application:** http://localhost:3001
- **Database:** `localhost:5430`
  - User: `postgres`
  - Password: `postgres`
  - Database: `mydatabase`

## Troubleshooting

### Database not initialized
If you see errors about missing tables:
1. Make sure the app container is running: `docker-compose ps`
2. Wait 10-15 seconds for the app to fully start
3. Run the init script:
   - **Linux/Mac:** `./scripts/init-db.sh`
   - **Windows PowerShell:** `.\scripts\init-db.ps1`
   - **Windows CMD:** `scripts\init-db.bat`

### Can't connect to database
1. Check if the database container is running: `docker-compose ps`
2. Check database logs: `docker-compose logs db`
3. Verify environment variables in `docker-compose.yml`

### Port already in use
If port 3001 or 5430 is already in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "3002:3000"  # Change 3001 to 3002
```

## Useful Commands

```bash
# View logs
docker-compose logs -f app
docker-compose logs -f db

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart (if you modify docker-compose.yml)
docker-compose up -d --force-recreate

# Remove everything (including data)
docker-compose down -v
```

## What Gets Initialized?

The initialization creates:
- ✅ All database tables (cotizacion, cliente, persona, empleado, viaje, vuelo, hotel, etc.)
- ✅ Default admin user
- ✅ Database schema structure

**Note:** This only creates the schema structure, not any sample data. The database will be empty except for the admin user.

