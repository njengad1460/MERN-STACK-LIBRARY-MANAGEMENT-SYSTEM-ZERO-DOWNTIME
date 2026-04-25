# MERN Stack Library Management System — Zero Downtime

A full-stack Library Management System built with the MERN stack, containerized with Docker, and deployed on AWS with zero-downtime infrastructure. Designed for Marist International University College (Marist-Mara University) — only `@mmarau.ac.ke` and `@student.mmarau.ac.ke` email addresses are permitted to register.

---

## Tech Stack

### Frontend
- React 19 + Vite 7
- Tailwind CSS v4
- React Router v7
- Axios
- Socket.IO Client
- React Hot Toast

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- Socket.IO
- bcryptjs, Helmet, Morgan, Compression

### Infrastructure & DevOps
- Docker + Docker Compose
- AWS ECR — container image registry (af-south-1, Cape Town)
- AWS EC2 — application hosting (af-south-1, Cape Town)
- AWS Secrets Manager — secure env var storage (af-south-1, Cape Town)
- AWS CloudFront — CDN with edge location in Nairobi, Kenya
- MongoDB Atlas — managed database
- GitHub Actions — CI/CD pipeline
- Nginx — reverse proxy inside the frontend container

---

## Project Structure

```
├── backend/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # JWT auth, admin guard
│   ├── models/             # Mongoose schemas (User, Book, Transaction)
│   ├── routes/             # Express routers
│   ├── index.js            # Entry point — DB connect + server start
│   ├── server.js           # Express app + Socket.IO setup
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── contexts/       # AuthContext, ThemeContext
│   │   ├── pages/          # Login, Register, Dashboard, Books, Profile, Admin
│   │   ├── services/       # Axios API client
│   │   └── componets/      # Layout, LoadingSpinner
│   ├── nginx.conf          # Nginx reverse proxy config
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions pipeline
└── docker-compose.yml
```

---

## Local Development

### Prerequisites
- Node.js 22+
- pnpm 10.23.0
- Docker + Docker Compose

### 1. Clone the repo
```bash
git clone https://github.com/njengad1460/MERN-STACK-LIBRARY-MANAGEMENT-SYSTEM-ZERO-DOWNTIME.git
cd MERN-STACK-LIBRARY-MANAGEMENT-SYSTEM-ZERO-DOWNTIME
```

### 2. Set up environment variables
```bash
# backend/.env
MONGO_URI=your_mongodb_atalas_url
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

### 3. Run without Docker
```bash
# Backend
cd backend && pnpm install && pnpm dev

# Frontend (separate terminal)
cd frontend && pnpm install && pnpm dev
```

### 4. Run with Docker Compose
```bash
docker compose up --build
```
Frontend → http://localhost:80
Backend health check → http://localhost:5000/health

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint    | Access  | Description          |
|--------|-------------|---------|----------------------|
| POST   | `/register` | Public  | Register new user    |
| POST   | `/login`    | Public  | Login + get JWT      |
| GET    | `/me`       | Private | Get current user     |

### Books — `/api/books`
| Method | Endpoint      | Access  | Description       |
|--------|---------------|---------|-------------------|
| GET    | `/`           | Private | List all books    |
| POST   | `/`           | Admin   | Add a book        |
| PUT    | `/:id`        | Admin   | Update a book     |
| DELETE | `/:id`        | Admin   | Delete a book     |

### Users — `/api/users`
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | `/`                   | Admin   | List all users       |
| GET    | `/dashboard/stats`    | Private | Dashboard statistics |
| PUT    | `/:id`                | Admin   | Update user          |
| DELETE | `/:id`                | Admin   | Delete user          |

### Transactions — `/api/transactions`
| Method | Endpoint          | Access  | Description           |
|--------|-------------------|---------|-----------------------|
| GET    | `/`               | Admin   | List all transactions |
| POST   | `/request`        | Private | Request a book        |
| POST   | `/return`         | Private | Return a book         |
| PUT    | `/:id/status`     | Admin   | Update status         |

---

## CI/CD Pipeline

The GitHub Actions pipeline runs on every push to `main` or `staging`:

```
push to main/staging
        │
        ▼
   [1] Lint Code
   ├── ESLint frontend
   └── ESLint backend
        │
        ▼
   [2] Build & Push to ECR  (af-south-1)
   ├── Build backend image → ECR
   └── Build frontend image → ECR
        │
        ▼
   [3] Invalidate CloudFront  (main branch only)
       Clears CDN cache so users get latest build
```

### Required GitHub Secrets

| Secret                  | Description                              |
|-------------------------|------------------------------------------|
| `AWS_ACCESS_KEY_ID`     | IAM user access key                      |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                      |
| `DIST_ID`               | CloudFront distribution ID               |

---

## AWS Infrastructure

> Infrastructure is managed via Terraform in a separate repository:
> [Library-Infrustructure-zero-downtime](https://github.com/njengad1460/Library-Infrustructure-zero-downtime)

### Architecture

```
Users (Kenya)
     │
     ▼
CloudFront CDN
(Edge: Nairobi, Kenya — me-south-1 edge)
     │
     ▼
EC2 Instance  (af-south-1 — Cape Town)
     │
     ├── frontend container (Nginx :80)
     │       │
     │       └── /api/* → proxy → backend:5000
     │
     └── backend container (:5000, internal only)
              │
              ▼
        MongoDB Atlas
```

### Key AWS Services

| Service           | Region              | Purpose                              |
|-------------------|---------------------|--------------------------------------|
| ECR               | af-south-1 (Cape Town) | Docker image registry             |
| EC2               | af-south-1 (Cape Town) | Runs Docker Compose stack         |
| Secrets Manager   | af-south-1 (Cape Town) | Stores MONGO_URI and JWT_SECRET   |
| CloudFront        | Global CDN (Nairobi edge) | HTTPS, caching, low latency for Kenyan users |

### EC2 User Data Flow
On instance launch, the user data script:
1. Installs Docker and AWS CLI
2. Fetches `MONGO_URI` and `JWT_SECRET` from Secrets Manager (`library-system/dev`)
3. Writes `/home/ubuntu/.env`
4. Authenticates Docker to ECR
5. Writes `docker-compose.yml` with image URIs from ECR
6. Runs `docker compose up -d`

### Required IAM Permissions for EC2 Role
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:GetSecretValue",
    "ecr:GetAuthorizationToken",
    "ecr:BatchGetImage",
    "ecr:GetDownloadUrlForLayer"
  ],
  "Resource": "*"
}
```

---

## Docker

### Backend Dockerfile highlights
- Base: `node:22-alpine`
- Non-root user (`app`) for security
- Production deps only (`pnpm install --prod`)
- Healthcheck on `/health` with `start_period: 40s`
- Starts with `node index.js` directly (no pnpm in production)

### Frontend Dockerfile highlights
- Multi-stage build — Node build stage + Nginx serve stage
- `VITE_API_URL=/api` baked in at build time
- Nginx proxies `/api/*` → `http://backend:5000/api/`

### docker-compose.yml
- Both services on a shared `app-network` bridge so nginx can resolve `backend` by name
- Frontend only starts after backend passes its healthcheck (`condition: service_healthy`)
- Backend uses `env_file: ./backend/.env` locally; on EC2 uses `env_file: /home/ubuntu/.env`

---

## Environment Variables

| Variable    | Required | Description                  |
|-------------|----------|------------------------------|
| `MONGO_URI` | Yes      | MongoDB connection string    |
| `JWT_SECRET`| Yes      | Secret for signing JWT tokens|
| `PORT`      | No       | Server port (default: 5000)  |
| `NODE_ENV`  | No       | `development` / `production` |

---

## Registration Rules

Only university email addresses are accepted:
- `@mmarau.ac.ke` — staff
- `@student.mmarau.ac.ke` — students

Passwords must be a minimum of 8 characters.

