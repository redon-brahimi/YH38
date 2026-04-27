# YH38 Database Schema

This directory contains the complete database schema for the YH38 repair management system.

## Files

- `schema.sql` - Complete database schema with tables, indexes, views, functions, and triggers

## Database Structure

### Tables
- **clients** - Client information (name, email, phone)
- **repairs** - Repair tickets with device details, status, and costs
- **appointments** - Scheduled appointments for repairs

### Key Features
- Foreign key relationships between tables
- Check constraints for data validation
- Indexes for query performance
- Views for simplified queries with French translations
- Functions for status/priority translation
- Triggers for automatic timestamp updates

## Usage

### With Docker (Recommended)
```bash
# The schema is automatically created when the containers start
docker-compose up --build
```

### Manual Setup
```bash
# Create database
createdb yh38_repair_db

# Run schema
psql -U postgres -d yh38_repair_db -f sql/schema.sql
```

### Within Docker Container
```bash
# Access the database container
docker exec -it yh38-db psql -U postgres -d yh38

# Run the schema file
\i /app/sql/schema.sql
```

## Schema Overview

- **Clients**: Store customer information
- **Repairs**: Track repair requests with status workflow
- **Appointments**: Schedule repair appointments

Status workflow: `pending` → `in_progress` → `fixed` → `ready_for_pickup`

Priority levels: `low`, `normal`, `high`, `urgent`

All tables include French translations for the frontend interface.