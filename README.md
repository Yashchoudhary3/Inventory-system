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

### Backend (Render / Railway / Fly.io)

1. Push `backend/` or the full repo to GitHub.
2. Create a **PostgreSQL** database on the platform.
3. Set environment variables:
   - `DATABASE_URL` — from hosted Postgres
   - `CORS_ORIGINS` — your Vercel/Netlify URL
4. Deploy with Dockerfile from `backend/Dockerfile` or:
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Docker Hub (backend image)

```bash
docker build -t YOUR_DOCKERHUB_USER/inventory-backend:latest ./backend
docker push YOUR_DOCKERHUB_USER/inventory-backend:latest
```

### Frontend (Vercel / Netlify)

1. Set root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Redeploy after backend URL is known.

### Post-deployment checklist

- [ ] Backend `/health` returns `{"status":"ok"}`
- [ ] Frontend loads and dashboard shows data
- [ ] CORS includes frontend URL in `CORS_ORIGINS`
- [ ] Create product → customer → order flow works

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

## Submission Checklist

- [ ] GitHub repository with frontend + backend
- [ ] Docker Hub link for backend image
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)

## License

MIT — for technical assessment purposes.
