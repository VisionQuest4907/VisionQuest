# DMSF3 – Health & Readiness

## Endpoints
- `GET /health` – basic service status
- `GET /ready` – includes database connection status

## How we tested
- Local: Run `npm start` then call:
  - `http://localhost:5000/health`
  - `http://localhost:5000/ready`
- Docker: Run `docker compose up` then call:
  - `http://localhost:5000/health`
  - `http://localhost:5000/ready`


