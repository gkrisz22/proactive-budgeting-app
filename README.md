# Proactive Budgeting

A modern, full-stack web application designed to help users manage their finances proactively. Unlike traditional budgeting apps that only show past spending, this system uses a spending-pace algorithm to predict budget breaches before they happen.

## 🚀 Features

* **Smart Rule Engine:** Set up budgets using customizable percentage splits (e.g., 50/30/20) based on monthly income.
* **Proactive Alerts:** Background jobs evaluate spending pace every 6 hours and alert you if a category is trending over budget.
* **Daily Safe-to-Spend:** A real-time calculation of how much you can safely spend today, factoring in upcoming planned events.
* **Fast Manual Entry:** Optimized UI for logging transactions in under 5 taps.
* **Event Planning & Reminders:** Log upcoming bills or events and receive notifications 14–28 days in advance.

## 🛠️ Technology Stack

* **Frontend:** React 19 (TypeScript, Vite, Tailwind CSS)
* **Backend:** Python 3.12, FastAPI, Uvicorn, APScheduler
* **Database:** PostgreSQL 16 (SQLAlchemy ORM)
* **Infrastructure:** Nginx Reverse Proxy, Docker Compose
* **Authentication:** JWT (JSON Web Tokens) with short-lived access and refresh tokens

## 📁 Repository Structure

This project uses a monorepo structure:

```text
proactive-budgeting/
├── backend/                 # FastAPI application and Python logic
├── frontend/                # React SPA and static assets
├── nginx/                   # Reverse proxy configuration
├── .env.example             # Environment variable templates
└── docker-compose.yml       # Production/Staging container orchestration
```

## ⚙️ Prerequisites

To run this project, you will need:
* [Docker](https://docs.docker.com/get-docker/) & Docker Compose  
* [Python 3.12+](https://www.python.org/downloads/) (for local backend development)  
* [Node.js 20+](https://nodejs.org/) & npm/yarn (for local frontend development)

## 💻 Local Development

### 1. Environment Setup
Copy the example environment file and configure your local secrets:

```bash
cp .env.example .env
```

### 2. Backend (FastAPI)
Navigate to the backend directory, set up a virtual environment, and run the development server:

```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run database migrations to create the tables
alembic upgrade head

uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.  
API documentation (Swagger) is auto-generated at `http://127.0.0.1:8000/api/v1/docs`.

### 3. Frontend (React/Vite)
Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. Docker Development

Alternatively, you can run the entire development stack using Docker Compose with Hot Module Replacement (HMR) enabled:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 5. Database Management
For detailed instructions on how the PostgreSQL database is configured, how to add new tables, and how to use Alembic for migrations, please see our dedicated [Database Management Guide](DB.md).

## 🐳 Docker Deployment

The application is fully containerized for deployment on a single VPS. Nginx handles TLS termination, serves the static React build, and proxies `/api/*` requests to the backend.

To build and start the entire stack:

```bash
docker compose up --build -d
```

To view container logs:

```bash
docker compose logs -f
```

To stop the stack:

```bash
docker compose down
```

*Note: The PostgreSQL database uses a named volume (`postgres_data`), so your data will persist even if the containers are destroyed.*