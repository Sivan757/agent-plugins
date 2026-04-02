# Database Conventions

## MySQL 8.0.28

### Database Naming

- Lowercase letters + underscores only
- No plurals (`order_system`, not `orders_systems`)
- Sharded databases: append number suffix (`order_db_01`, `order_db_02`)
- Database name must reflect the business domain

### Character Set

Every database and table must use:

```sql
CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
```

Create database example:

```sql
CREATE DATABASE order_system
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;
```

### Table Design Rules

- Engine: InnoDB (always)
- Every table MUST have a `COMMENT` describing its purpose
- Lowercase + underscores for table names, no plurals
- Partitioned/sharded tables: `table_name_01`, `table_name_02`

Create table template:

```sql
CREATE TABLE order_item (
    id              bigint unsigned   NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
    order_id        bigint unsigned   NOT NULL COMMENT 'Order ID reference',
    product_name    varchar(200)      NOT NULL COMMENT 'Product name',
    quantity        int unsigned      NOT NULL COMMENT 'Quantity ordered',
    unit_price      decimal(10,2)     NOT NULL COMMENT 'Unit price',
    creator_id      bigint unsigned   NOT NULL COMMENT 'Creator user ID',
    created_time    datetime          NOT NULL COMMENT 'Creation time',
    reviser_id      bigint unsigned   NULL     COMMENT 'Last reviser user ID',
    revised_time    datetime          NULL     COMMENT 'Last revision time',
    deleted         tinyint unsigned  NOT NULL DEFAULT 0 COMMENT 'Logical delete: 0=active, 1=deleted',
    PRIMARY KEY (id),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci
  COMMENT='Order line items';
```

### Field Type Rules

| Rule | Details |
|------|---------|
| ID fields | `bigint unsigned`, first field in every table (except pure join tables) |
| Boolean fields | `tinyint unsigned` -- no `is_` prefix (`deleted` not `is_deleted`, `enabled` not `is_enabled`) |
| Money/precision | `decimal(M,D)` -- never `float` or `double` |
| Strings | `varchar(N)` with max N=5000 -- for longer text, create a separate extension table with BLOB/TEXT |
| Every field | MUST have a `COMMENT` |
| Field name length | Max 32 characters |
| Cross-table consistency | Same logical field must use same type everywhere (e.g., `user_id` is always `bigint unsigned`) |

### Mandatory Fields

Every table (except pure join/mapping tables) MUST include:

```sql
-- Mandatory fields -- add to every new table
id              bigint unsigned   NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
creator_id      bigint unsigned   NOT NULL                COMMENT 'Creator user ID',
created_time    datetime          NOT NULL                COMMENT 'Creation time',
reviser_id      bigint unsigned   NULL                    COMMENT 'Last reviser user ID',
revised_time    datetime          NULL                    COMMENT 'Last revision time',
deleted         tinyint unsigned  NOT NULL DEFAULT 0      COMMENT 'Logical delete: 0=active, 1=deleted',
```

ALTER TABLE statements to add mandatory fields to existing tables:

```sql
ALTER TABLE existing_table
    ADD COLUMN creator_id   bigint unsigned NOT NULL COMMENT 'Creator user ID',
    ADD COLUMN created_time datetime        NOT NULL COMMENT 'Creation time',
    ADD COLUMN reviser_id   bigint unsigned NULL     COMMENT 'Last reviser user ID',
    ADD COLUMN revised_time datetime        NULL     COMMENT 'Last revision time',
    ADD COLUMN deleted      tinyint unsigned NOT NULL DEFAULT 0 COMMENT 'Logical delete: 0=active, 1=deleted';
```

### Optional Standard Fields

```sql
-- Optional fields -- add when the business requires them
ALTER TABLE existing_table
    ADD COLUMN creator_name varchar(20) NULL COMMENT 'Creator display name',
    ADD COLUMN reviser_name varchar(20) NULL COMMENT 'Reviser display name',
    ADD COLUMN enabled      tinyint unsigned NOT NULL DEFAULT 1 COMMENT 'Enable flag: 1=enabled, 0=disabled';
```

### Index Rules

Naming conventions:

| Prefix | Type | Example |
|--------|------|---------|
| `pk_` | Primary key | `pk_id` (usually just `PRIMARY KEY`) |
| `uk_` | Unique index | `uk_order_no` |
| `fk_` | Foreign key reference index | `fk_user_id` |
| `idx_` | Regular index | `idx_created_time` |

Rules:
- Index type: BTREE
- Max 5 indexes per table
- Create unique indexes for business-unique fields (order number, phone number, etc.)
- **No foreign key constraints** -- use regular indexes on FK columns instead
- VARCHAR indexes MUST specify prefix length when the column is long

```sql
-- Unique index for business key
CREATE UNIQUE INDEX uk_order_no ON order_info (order_no);

-- Regular index on FK column (no FK constraint)
CREATE INDEX idx_user_id ON order_info (user_id);

-- Composite index
CREATE INDEX idx_status_created ON order_info (status, created_time);

-- VARCHAR prefix index
CREATE INDEX idx_product_name ON order_item (product_name(50));
```

### SQL Statement Rules

- Use `count(*)` not `count(column_name)` -- `count(column_name)` skips NULLs which is rarely intended
- Use parameterized queries -- never concatenate user input into SQL strings
- Prefer `EXISTS` over `IN` for subqueries with large result sets
- Avoid `SELECT *` -- list specific columns

## PostgreSQL

PostgreSQL conventions follow similar principles to MySQL with these differences:

- Use `SERIAL` or `BIGSERIAL` for auto-increment IDs (or `GENERATED ALWAYS AS IDENTITY` in newer versions)
- Use `BOOLEAN` type instead of `tinyint` for boolean fields
- Use `TIMESTAMPTZ` instead of `datetime` for timezone-aware timestamps

See full details: [PostgreSQL Conventions](https://aikero-docs.robotees.tech/conventions/db/postgresql.html)

## MongoDB

MongoDB is used for document-oriented data where the schema is flexible:

- Collection naming: lowercase + underscores, singular form
- Document design: embed related data when read together, reference when independent
- Always create indexes for query patterns

See full details: [MongoDB Conventions](https://aikero-docs.robotees.tech/conventions/db/MongoDB.html)

## ElasticSearch

ElasticSearch is used for full-text search and analytics:

- Index naming: lowercase + underscores, include date suffix for time-series data
- Mapping: define explicit mappings, avoid dynamic mapping in production
- Aliases: use aliases for zero-downtime reindexing

See full details: [ElasticSearch Conventions](https://aikero-docs.robotees.tech/conventions/db/ElasticSearch.html)
