# PharmaBuddy API

REST API for PharmaBuddy, a platform for ordering medicines from nearby pharmacies.

**Live:** https://pharmabuddy-api.purplewave-e1671062.uaenorth.azurecontainerapps.io/health
*(scales to zero when idle, so the first request may take a few seconds)*

![CI](https://github.com/ahmadabdullahcse/PharmaBuddy_Backend/actions/workflows/ci.yml/badge.svg)

## Stack
Node.js 22 · Express · MongoDB Atlas · Docker · GitHub Actions · Azure Container Apps

## Architecture
```
git push → GitHub Actions
            ├─ test-and-build: npm ci → tests (against a MongoDB service container) → docker build → push to GHCR (:latest, :<commit-sha>)
            └─ deploy (main only, after tests pass): OIDC login to Azure → update Container App to :<commit-sha> → smoke test /health
Azure Container Apps (UAE North, scale 0–2) ──► MongoDB Atlas (Mumbai)
```

## Run locally
```bash
cp .env.example .env        # fill in MONGODB_URI
npm install
npm start                   # http://localhost:3000/health
```

With Docker:
```bash
docker build -t pharmabuddy-api .
docker run --rm --env-file .env -p 3000:3000 pharmabuddy-api
```

## Tests
```bash
docker run -d --name test-mongo -p 27017:27017 mongo:7
MONGODB_URI=mongodb://localhost:27017 npm test
```

## Configuration
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (stored as a Container Apps secret in production) |
| `PORT` | Port to listen on (default 5000) |

## Main endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/medicine` | List medicines |
| POST | `/medicine` | Add a medicine |
| GET | `/pharmacies` | List pharmacies |
| POST | `/customer` | Register a customer |
| POST | `/order` | Place an order |
| GET | `/order/:email` | Orders for a user |

## History
Built in 2023 as a university team project.
In 2026 I modernized it for production:
- Moved secrets out of source code into environment variables
- Containerized it (Node 22 LTS, non-root user, no secrets baked into the image)
- Added API tests, which caught two real bugs:
  - every POST route returned **500** even on success (`insertedCount` was removed in MongoDB driver v4; fixed with `acknowledged`)
  - `/customer` and `/feedback` sent two responses, which would crash the server
- Built CI/CD: tests → image on GHCR → deploy to Azure Container Apps using **OIDC** (no stored cloud passwords), with an identity limited to this one app