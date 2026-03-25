# ExpenseTracker — Budget Board

A Kanban-style personal budget tracker for managing expenses across Thailand and South Africa.

**Stack:** React + Vite · Flask · PostgreSQL · Docker

---

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone / copy the project
```
ExpenseTracker/
├── docker-compose.yml
├── db/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
```

### 2. Start everything
```bash
docker-compose up --build
```

First run takes ~2 minutes to build. After that:

| Service  | URL                        |
|----------|----------------------------|
| App      | http://localhost:3001      |
| API      | http://localhost:5001/api  |
| Database | localhost:5433             |

### 3. Stop
```bash
docker-compose down
```

### 4. Stop and wipe database
```bash
docker-compose down -v
```

---

## Usage

- **Click any label or amount** to edit it inline
- **+ add** to add a new income, expense or debt entry
- **✕** to delete a row
- **‹ ›** to navigate between months
- **↻ Rollover** copies all recurring entries to the next month
- **⚙ Settings** to adjust the ZAR/THB exchange rate (saved to DB)

---

## Development (without Docker)

### Backend
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=postgresql://expensetracker:expensetracker123@localhost:5432/expensetracker
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/months                     | List all months          |
| GET    | /api/months/:year/:month        | Get month + entries      |
| POST   | /api/months                     | Create month (+ rollover)|
| POST   | /api/entries                    | Create entry             |
| PUT    | /api/entries/:id                | Update entry             |
| DELETE | /api/entries/:id                | Delete entry             |
| GET    | /api/settings                   | Get settings             |
| PUT    | /api/settings                   | Update settings          |

---

## Database

PostgreSQL 16. Data persists in a Docker named volume `pgdata`.

To connect directly:
```bash
docker exec -it expensetracker_db psql -U expensetracker -d expensetracker
```

Useful queries:
```sql
-- See all entries for current month
SELECT e.category, e.label, e.amount, e.currency
FROM entries e
JOIN months m ON m.id = e.month_id
WHERE m.year = 2026 AND m.month = 3
ORDER BY e.category, e.sort_order;

-- Check settings
SELECT * FROM settings;
```
