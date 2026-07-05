# 🚢 ShipOps - Core Service

The **Core Service** is the main business service of the ShipOps platform.

It manages the shipping domain, including:

- Companies
- Fleets
- Ships
- Ports
- Voyages
- Cargo
- Documents
- Dashboard APIs

This service is part of the ShipOps microservices architecture.

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Docker
- Zod
- JWT
- Swagger (Coming Soon)

---

## Project Structure

```
core-service
├── prisma
├── src
│   ├── database
│   ├── middleware
│   ├── modules
│   ├── routes
│   ├── app.js
│   └── server.js
├── uploads
├── .env
├── package.json
└── prisma.config.js
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>

cd core-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file.

```env
PORT=5000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shipops_core?schema=public"

JWT_SECRET=your_secret
```

### 4. Start PostgreSQL

From the project workspace:

```bash
docker compose up -d
```

### 5. Apply database migrations

```bash
npx prisma migrate dev
```

### 6. Start the server

```bash
npm run dev
```

The API will be available at:

```
http://localhost:5000
```

---

## Documentation

Detailed documentation is available in the **docs** folder.

- [Setup Guide](docs/setup.md)
- Database Guide *(Coming Soon)*
- API Documentation *(Coming Soon)*
- Architecture *(Coming Soon)*

---

## Development Status

- Project Setup
- Express Server
- Docker
- PostgreSQL
- Prisma
- Initial Migration
- Company Module
- Fleet Module
- Ship Module
- Voyage Module
- Cargo Module

