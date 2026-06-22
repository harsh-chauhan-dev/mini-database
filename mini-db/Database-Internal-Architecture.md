# 🗄️ Database Architecture Internals

> A complete guide to understanding how databases process queries internally, manage storage, execute CRUD operations, and ensure data consistency.

---

# 📖 Introduction

When you execute a query like:

```sql
SELECT * FROM users WHERE id = 10;
```

The database does much more than simply reading data from disk.

A modern database such as PostgreSQL or MySQL passes the query through multiple layers including parsing, optimization, execution, caching, storage management, indexing, transaction handling, and recovery mechanisms.

---

# 🏗️ High-Level Database Architecture

```text
Client
  │
  ▼
Parser
  │
  ▼
Query Planner (Optimizer)
  │
  ▼
Execution Engine
  │
  ▼
Buffer Cache
  │
  ▼
Storage Engine
  │
  ▼
Disk Storage
```

---

# 1️⃣ Client Layer

The client is any application that sends SQL queries to the database.

### Examples

* Node.js Application
* React + Backend API
* Java Application
* Python Application
* pgAdmin
* MySQL Workbench

### Example

```js
const result = await db.query(
  "SELECT * FROM users WHERE id = 10"
);
```

---

# 2️⃣ Parser

The Parser validates the SQL query.

## Responsibilities

### Syntax Validation

Valid Query:

```sql
SELECT * FROM users;
```

Invalid Query:

```sql
SELEC * FROM users;
```

Result:

```text
Syntax Error
```

### Semantic Validation

Checks:

* Table exists?
* Column exists?
* User permissions?

Example:

```sql
SELECT salary FROM users;
```

If the column doesn't exist:

```text
Column Not Found
```

---

## Abstract Syntax Tree (AST)

The parser converts SQL into an internal tree structure.

Query:

```sql
SELECT name
FROM users
WHERE id = 5;
```

AST:

```text
SELECT
 │
 ├── name
 │
 └── users
      │
      └── id = 5
```

---

# 3️⃣ Query Planner (Optimizer)

The optimizer determines the most efficient way to execute a query.

## Example

```sql
SELECT * FROM users WHERE id = 5;
```

### Plan A — Full Table Scan

```text
1
2
3
4
5
...
10000000
```

Complexity:

```text
O(n)
```

### Plan B — Use Index

```text
B+ Tree Search
```

Complexity:

```text
O(log n)
```

The optimizer estimates:

* CPU Cost
* Memory Usage
* Disk Reads

Then chooses the cheapest execution plan.

---

# 4️⃣ Execution Engine

The Execution Engine performs the plan selected by the optimizer.

Example:

```text
Open Index
    ↓
Search Key
    ↓
Locate Page
    ↓
Fetch Row
    ↓
Return Result
```

### Important

* Optimizer decides
* Execution Engine executes

---

# 5️⃣ Buffer Cache

Disk access is slow.

RAM access is fast.

Databases keep frequently accessed pages in memory.

```text
Disk
 ↓
Page
 ↓
Buffer Cache
```

---

## Cache Hit

```sql
SELECT * FROM users WHERE id = 5;
```

Data already exists in RAM.

Result:

```text
No Disk Read
Fast Response
```

---

## Cache Miss

Data not present in memory.

```text
Read From Disk
      ↓
Load Into Cache
      ↓
Return Result
```

---

# 6️⃣ Storage Engine

The Storage Engine manages:

* Reading Data
* Writing Data
* Indexes
* Transactions
* Recovery

Think of it as the file manager of the database.

### Responsibilities

```text
Read Page
Write Page
Manage Indexes
Handle WAL
```

---

# 7️⃣ Disk Storage

All data is ultimately stored on disk.

Example:

```text
users table
```

Stored internally as:

```text
users.data
```

---

## Page-Based Storage

Databases do not read individual rows.

They read entire pages.

```text
Page
 ├── Row
 ├── Row
 └── Row
```

### PostgreSQL Default

```text
8 KB Page
```

Example:

```text
Page 1

1 Harsh
2 Amit
3 Rahul
```

---

# 8️⃣ Index Manager

Indexes allow fast data retrieval.

Without an index:

```sql
SELECT * FROM users
WHERE id = 1000;
```

Search:

```text
1
2
3
...
1000
```

Complexity:

```text
O(n)
```

---

## B+ Tree Index

```text
            [50]
           /    \
        [20]    [80]
```

Complexity:

```text
O(log n)
```

---

## Linked Leaf Nodes

```text
[1,5,10]
    ↔
[20,30,40]
    ↔
[50,60,70]
```

Leaf nodes are connected using a doubly linked list.

This makes range queries extremely efficient.

Example:

```sql
SELECT *
FROM users
WHERE id BETWEEN 20 AND 50;
```

---

# 9️⃣ Write Ahead Log (WAL)

Before updating actual data pages, the database writes changes to a log file.

Example:

```sql
UPDATE users
SET name='Harsh'
WHERE id=1;
```

WAL Record:

```text
UPDATE id=1
new value=Harsh
```

---

## Why WAL?

If the server crashes:

```text
Crash
  ↓
Read WAL
  ↓
Replay Changes
  ↓
Recover Database
```

This guarantees durability.

---

# 🔟 Transaction Manager

Handles transactions.

Example:

```sql
BEGIN;

UPDATE account
SET balance=balance-1000
WHERE id=1;

UPDATE account
SET balance=balance+1000
WHERE id=2;

COMMIT;
```

---

## ACID Properties

### Atomicity

All operations succeed or none succeed.

### Consistency

Database remains valid.

### Isolation

Concurrent transactions don't interfere.

### Durability

Committed data survives crashes.

---

# 1️⃣1️⃣ Lock Manager

Prevents concurrent modifications from corrupting data.

Example:

```text
User A → UPDATE Row
User B → UPDATE Same Row
```

Database applies locks:

```text
User A Gets Lock
User B Waits
```

---

# 1️⃣2️⃣ MVCC (Multi-Version Concurrency Control)

Used heavily in PostgreSQL.

Instead of overwriting rows:

Before:

```text
Harsh
```

After:

```text
Harsh Chauhan
```

Database creates:

```text
Version 1
Version 2
```

Benefits:

* Readers don't block writers
* Writers don't block readers
* Better concurrency

---

# 🔄 Complete Query Flow

```sql
SELECT * FROM users WHERE id = 10;
```

```text
1. Client Sends Query
            │
            ▼
2. Parser
            │
            ▼
3. Query Optimizer
            │
            ▼
4. Execution Engine
            │
            ▼
5. Index Lookup (B+ Tree)
            │
            ▼
6. Buffer Cache Check
            │
     ┌──────┴──────┐
     │             │
 Cache Hit    Cache Miss
     │             │
     │             ▼
     │      Read Disk Page
     │             │
     └──────► Buffer Cache
                   │
                   ▼
7. Return Row
                   │
                   ▼
8. Send Result To Client
```

---

# 📚 Data Structures Used Internally

| Database Component | Data Structure   |
| ------------------ | ---------------- |
| Indexes            | B+ Tree          |
| Cache Lookup       | Hash Table       |
| Buffer Management  | Linked List      |
| Query Scheduling   | Heap             |
| Storage Pages      | Arrays           |
| Query Planning     | Graph Algorithms |
| Transactions       | Logs + Queues    |

---

# 🎯 Learning Roadmap

## Beginner

* SQL
* CRUD Operations
* Constraints
* Joins
* Normalization

## Intermediate

* Indexing
* B+ Trees
* Query Plans
* Transactions

## Advanced

* WAL
* MVCC
* Locking
* Buffer Pools
* Storage Engines

## Expert

* PostgreSQL Internals
* InnoDB Internals
* Replication
* Sharding
* Distributed Databases

---

# 🚀 Conclusion

A modern database is not just a storage system.

It is a combination of:

* Data Structures
* Algorithms
* Operating Systems
* File Systems
* Memory Management
* Concurrency Control
* Networking

All working together to execute queries efficiently, reliably, and safely at massive scale.