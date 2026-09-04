# Database Indexing Architecture & Best Practices Guide

This document serves as a standard, reusable database indexing specification and copy-paste reference guide for PostgreSQL / Supabase applications. You can reuse this pattern across projects to optimize query performance, prevent full table scans, and ensure high-throughput scaling.

---

## 1. Overview & Core Indexing Principles

Indexes in PostgreSQL use B-Tree by default to store key-to-tuple mappings in a balanced hierarchy. Without indexes, database queries perform sequential scans ($O(N)$ runtime) over millions of rows.

### Key Rules for Creating Indexes:

1. **Foreign Key Indexing**: Always index foreign key columns (`user_id`, `client_id`, `program_id`). Foreign keys are frequently used in `JOIN` conditions and `WHERE` filters.
2. **Composite Indexes (Multi-Column)**: When queries frequently filter by multiple columns together (e.g. `client_id` AND `log_date`), create a composite B-Tree index.
   - **Equality First, Range/Sort Second**: Put strict equality filter columns first, followed by range (`>`, `<`) or sorting (`ORDER BY`) columns.
   - Example: `CREATE INDEX idx_workout_logs ON workout_logs (client_id, log_date DESC);`
3. **Low-Cardinality Column Filtering**: Avoid single-column indexes on low-cardinality boolean or status columns (e.g. `is_active = true`) unless combined with high-cardinality columns in a composite index.
4. **Idempotence**: Always use `CREATE INDEX IF NOT EXISTS` in migration scripts so migrations run cleanly without throwing collision errors.

---

## 2. Comprehensive SQL Index Blueprint

Copy and run the following SQL script in your PostgreSQL / Supabase SQL Editor to establish high-performance lookup indexes across all domain models:

```sql
-- ==============================================================================
-- DATABASE INDEXING SPECIFICATION
-- Target Engine: PostgreSQL 12+ / Supabase
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER PROFILES & AUTHENTICATION
-- ------------------------------------------------------------------------------
-- Fast lookups by email and system user roles (e.g., coach vs client)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ------------------------------------------------------------------------------
-- 2. CLIENT MANAGEMENT
-- ------------------------------------------------------------------------------
-- Lookups by user identity, status, program assignment, and composite filtering
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_program_id ON public.clients(current_program_id);

-- Composite Index: Filters active/inactive clients assigned to a specific program
CREATE INDEX IF NOT EXISTS idx_clients_program_status ON public.clients(current_program_id, status);

-- ------------------------------------------------------------------------------
-- 3. WORKOUT LOGS & EXERCISES
-- ------------------------------------------------------------------------------
-- Category lookups for exercise catalogs
CREATE INDEX IF NOT EXISTS idx_exercises_category ON public.exercises(category);

-- Composite Index: Chronological client workout logs (High velocity queries)
-- Enables instant retrieval of client workout history sorted by latest date first
CREATE INDEX IF NOT EXISTS idx_workout_logs_client_date ON public.workout_logs(client_id, log_date DESC);

-- ------------------------------------------------------------------------------
-- 4. WORKOUT REQUESTS & ASSIGNMENTS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_requests_client_id ON public.workout_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.workout_requests(status);

-- Composite Index: Quick status checks per client (e.g., pending requests for Client X)
CREATE INDEX IF NOT EXISTS idx_requests_client_status ON public.workout_requests(client_id, status);

-- ------------------------------------------------------------------------------
-- 5. PAYMENTS & FINANCIAL TRANSACTIONS
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Composite Index: Client payment status lookups (e.g., completed/overdue invoices)
CREATE INDEX IF NOT EXISTS idx_payments_client_status ON public.payments(client_id, status);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS & ALERTS
-- ------------------------------------------------------------------------------
-- Composite Index: Unread notifications per recipient ordered by newest first
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_date ON public.notifications(recipient_id, read, created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. NUTRITION & MEAL TRACKING
-- ------------------------------------------------------------------------------
-- Composite Index: Daily user macro/meal lookups
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date_str);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_meal_type ON public.meal_logs(user_id, meal_type);

-- Text lookups for custom added foods
CREATE INDEX IF NOT EXISTS idx_custom_foods_name ON public.custom_foods(name);

-- ------------------------------------------------------------------------------
-- 8. SCHEDULING & BOOKINGS
-- ------------------------------------------------------------------------------
-- Coach weekly working hours lookups
CREATE INDEX IF NOT EXISTS idx_coach_availability_coach ON public.coach_availability(coach_id, day_of_week);

-- Booking session lookups per client/coach by date & status
CREATE INDEX IF NOT EXISTS idx_booking_sessions_client ON public.booking_sessions(client_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_coach ON public.booking_sessions(coach_id, date);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_status ON public.booking_sessions(status);
```

---

## 3. Query Performance & Index Verification

### Diagnostic Tools

To analyze whether PostgreSQL is using your indexes properly, run the `EXPLAIN ANALYZE` command on critical queries:

```sql
EXPLAIN ANALYZE 
SELECT * FROM public.workout_logs 
WHERE client_id = 'usr_12345' 
ORDER BY log_date DESC 
LIMIT 20;
```

#### What to look for in query plans:
- ✅ **Index Scan / Index Only Scan**: Target index was used effectively.
- ❌ **Seq Scan (Sequential Scan)**: Full table scan occurred; missing index or invalid column ordering.

### Auditing Unused Indexes

Over-indexing can slow down `INSERT`, `UPDATE`, and `DELETE` operations. Monitor index usage using PostgreSQL system statistics:

```sql
SELECT 
    schemaname,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS number_of_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
```

---

## 4. Summary Matrix: Indexing Patterns

| Use Case | Query Pattern | Recommended Index Type | Example SQL |
| :--- | :--- | :--- | :--- |
| **Foreign Key Lookups** | `WHERE client_id = ?` | Single Column B-Tree | `CREATE INDEX idx_fk ON table(client_id)` |
| **Chronological Feed** | `WHERE user_id = ? ORDER BY created_at DESC` | Composite B-Tree | `CREATE INDEX idx_user_time ON table(user_id, created_at DESC)` |
| **Multi-Filter State** | `WHERE status = 'pending' AND client_id = ?` | Composite B-Tree | `CREATE INDEX idx_client_status ON table(client_id, status)` |
| **Search / Prefix Match** | `WHERE name ILIKE 'chicken%'` | B-Tree / GIN (trgm) | `CREATE INDEX idx_food_name ON custom_foods(name)` |
