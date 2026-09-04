# SCDP Stock Information Platform - Python (FastAPI) Backend

Production-oriented Python (FastAPI) backend for the SCDP Stock Information Platform. This application acts as a secure, fast API layer reading from a synchronized local PostgreSQL copy of the authoritative SCDP source stock database.

## 1. Core Architecture

The database of the SCDP source system remains the authoritative master. To ensure high availability and responsiveness:
1. The backend reads stock information from the **Application PostgreSQL database**, rather than querying the master SCDP source database for every client request.
2. A generic, configuration-driven **Synchronization Engine** updates the local PostgreSQL database on demand or scheduled intervals.
3. The sync system can run in **Mock Mode** using generated mock data when the master SCDP database is unavailable, and easily switch to a **Real PostgreSQL Database** connection via environment configuration.

```text
SCDP SOURCE DATABASE (Read-only master)
       │
       ▼ (Via ScdpSourceAdapter / MockSourceAdapter)
SYNCHRONIZATION ENGINE
       │
       ▼ (Incremental generic upsert)
APPLICATION POSTGRESQL (Auth, Stock copies, Sync logs)
       │
       ▼
FASTAPI BACKEND API (JWT authentication, role dependencies)
       │
       ▼
FRONTEND CLIENTS
```

---

## 2. Technology Stack

* **Framework**: FastAPI (Async)
* **ASGI Server**: Uvicorn
* **Database & ORM**: PostgreSQL with SQLAlchemy (Async) / asyncpg
* **Schema Reference**: Prisma Schema (`prisma/schema.prisma`)
* **Security & Auth**: JWT (`python-jose`), Passlib bcrypt (password hashing)
* **API Documentation & Validation**: OpenAPI / Swagger UI (`/docs`), Pydantic v2
* **Testing**: pytest & pytest-asyncio (26 unit/integration tests)

---

## 3. Project Directory Structure

```
scdp-backend/
├── app/
│   ├── main.py                 # FastAPI application setup & middleware
│   ├── config.py               # Pydantic settings & env management
│   ├── database.py             # SQLAlchemy async engine & session manager
│   ├── seed.py                 # Database seed script for system administrator
│   ├── models/                 # SQLAlchemy data models
│   ├── routers/                # FastAPI API endpoint routers
│   ├── services/               # Core business logic services
│   └── common/                 # Decorators, exceptions, and response middleware
├── tests/                      # pytest test suite
├── prisma/
│   └── schema.prisma           # Prisma database schema definition
├── main.py                     # Root entry point script
├── requirements.txt            # Python dependencies
├── .env.example                # Configuration environment template
└── SCDP_API.postman_collection.json  # Postman API collection
```

---

## 4. Getting Started

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Database Seed
Seed the initial system administrator account (`admin@scdp.com` / `admin123`):
```bash
python -m app.seed
```

### 4. Start the Server
Development mode with auto-reload:
```bash
python main.py
```
Or directly with Uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server starts at `http://localhost:8000/api/v1`.

Interactive API documentation:
* **Swagger UI**: `http://localhost:8000/docs`

---

## 5. Verification & Tests

Run the pytest suite:
```bash
python -m pytest
```