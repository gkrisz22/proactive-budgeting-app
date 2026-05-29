# Database Management Guide

This document explains how the database is structured, configured, and managed in the Proactive Budgeting application. We use PostgreSQL as the database, SQLAlchemy 2.0 as our ORM (Object Relational Mapper), and Alembic for database migrations.

## 1. Infrastructure & Connection

Our database runs as a Docker container.
- **Service Name:** `db`
- **Image:** `postgres:16`
- **Port:** `5432` (Exposed to the host machine in dev via `docker-compose.dev.yml`)

### Connection Strings
The application connects to the database using a **Connection String** (Database URL). 
You can find this configured in `backend/app/core/config.py`.

- **When running inside Docker:** `postgresql://postgres:Password1@db:5432/proactive_budgeting` (it uses the hostname `db`).
- **When running locally (via `uvicorn` on your host):** `postgresql://postgres:Password1@localhost:5432/proactive_budgeting` (it uses `localhost` because it connects through the port exposed by Docker).

> **Important:** If you encounter a `database "proactive_budgeting" does not exist` error, you need to connect to your PostgreSQL instance using a tool like pgAdmin or DBeaver (on `localhost:5432`) and manually create an empty database named `proactive_budgeting`.

---

## 2. SQLAlchemy ORM (The Code)

SQLAlchemy is the tool that translates Python classes into SQL tables. 

### The Setup
- **`app/db/database.py`**: This file creates the `engine` (the core connection to the database) and `SessionLocal` (a factory for creating database sessions). It also exports a `get_db()` dependency used by FastAPI endpoints to get a database session per request.
- **`app/models/base.py`**: Contains `Base = DeclarativeBase()`. All your database models must inherit from this `Base` class.

### Creating Models
Models are defined in `app/models/`. For example, `user.py`:
```python
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    # ...
```
> **Rule of Thumb:** Every time you create a new model file, you MUST import it into `app/models/__init__.py`. If you don't, Alembic won't "see" it and your tables won't be created.

---

## 3. Alembic (Migrations)

Alembic is our migration tool. It serves the exact same purpose as `prisma migrate` or `drizzle-kit`. It tracks changes to your Python models and generates SQL scripts to apply those changes to the database.

The Alembic setup lives in the `backend/alembic/` folder and `backend/alembic.ini`.

### The Migration Workflow

Whenever you add a new model or change a column, follow these two steps from inside the `backend` directory:

#### Step 1: Generate the Migration Script
This is equivalent to `prisma migrate dev --create-only`. It scans your `app/models`, compares them to the current database, and creates a Python file in `alembic/versions/` with the necessary `CREATE TABLE` or `ALTER TABLE` instructions.

```bash
# Ensure your virtual environment is active!
alembic revision --autogenerate -m "Describe your change here"
```

#### Step 2: Apply the Migration
This is equivalent to `prisma migrate deploy`. It takes the generated script and runs it against the PostgreSQL database.

```bash
alembic upgrade head
```

### Rollbacks (Undoing a Mistake)
If you made a mistake in a migration and want to revert the database to the previous state:
```bash
alembic downgrade -1
```

## 4. Cheat Sheet for Daily Workflow

1. Create/Modify a Python model in `backend/app/models/`.
2. Ensure the model is imported in `backend/app/models/__init__.py`.
3. Open terminal in `backend/`.
4. Run `alembic revision --autogenerate -m "added something"`.
5. Run `alembic upgrade head`.
6. Start coding your FastAPI routes using `get_db`!
