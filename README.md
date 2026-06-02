# Inventory & Order Management System

Full-stack production-ready application for managing **products**, **customers**, **orders**, and **inventory** — built with FastAPI, React, PostgreSQL, and Docker.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, SQLAlchemy |
| Frontend | React (Vite), Axios, React Router |
| Database | PostgreSQL 16 |
| Containers | Docker, Docker Compose |

## Features

- **Products** — CRUD with unique SKU, non-negative stock
- **Customers** — Create, list, view, delete (unique email)
- **Orders** — Multi-line orders, auto total calculation, stock deduction
- **Dashboard** — Totals + low-stock alerts (≤ 10 units)
- **Business rules** — Insufficient stock blocked; stock restored on order delete

## Quick Start (Docker)

```bash
cd Inventory
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL to your local Postgres
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Create frontend/.env with: VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get order |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |
| GET | `/dashboard/stats` | Dashboard summary |
| GET | `/health` | Health check |

### Create Order Example

```json
POST /orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (backend) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `POSTGRES_USER` | DB user (docker-compose) |
| `POSTGRES_PASSWORD` | DB password (docker-compose) |
| `POSTGRES_DB` | Database name |
| `VITE_API_URL` | Backend URL baked into frontend build |

## Deployment

### Frontend Deployment

* Hosted on Vercel
* URL: https://project-chl5a.vercel.app/

### Backend Deployment

* Hosted on Render
* URL: https://inventory-system-63d7.onrender.com
* Health Check: https://inventory-system-63d7.onrender.com/health
* API Documentation: https://inventory-system-63d7.onrender.com/docs

### Database

* PostgreSQL
* Hosted on Neon

### Docker Image

Docker Hub Repository:
https://hub.docker.com/r/yashchoudhary1512/inventory

Pull Image:

```bash
docker pull yashchoudhary1512/inventory:latest
```

## Running the Application

### Using Docker Compose (Recommended)

```bash
docker compose up --build
```

This starts:

* PostgreSQL database
* FastAPI backend
* React frontend

### Running Backend Docker Image Only

```bash
docker pull yashchoudhary1512/inventory:latest
```

The standalone backend image requires a valid `DATABASE_URL` environment variable because the application depends on PostgreSQL.

Example:

```bash
docker run -e DATABASE_URL=<postgres_connection_string> -p 8000:8000 yashchoudhary1512/inventory:latest
```

## Project Structure

```
Inventory/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   └── routers/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Submission Deliverables

### GitHub Repository

https://github.com/Yashchoudhary3/Inventory-system

### Frontend URL

<PASTE_YOUR_VERCEL_URL>

### Backend API URL

https://inventory-system-63d7.onrender.com

### Docker Hub Image

https://hub.docker.com/r/yashchoudhary1512/inventory

## License

MIT — for technical assessment purposes.
