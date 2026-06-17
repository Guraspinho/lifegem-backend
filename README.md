# LifeGem Backend

> AI-powered medical simulation platform train as a doctor against realistic, AI-generated patients in real time.

LifeGem is a clinical training simulator. A user picks a medical specialty, and an LLM generates a unique patient with a hidden condition, vitals, history and allergies. Over a live WebSocket chat, the user examines and talks to the patient, then commits to a final diagnosis. The AI then grades the session did the patient survive, was the diagnosis correct, and what could have been done better and persists the result so users can track their progress over time.

---

## Features

- **Real-time patient simulations** over WebSockets (Socket.IO) start a session, chat with an AI patient, submit a diagnosis, and receive a graded review.
- **LLM-driven gameplay** powered by [Ollama](https://ollama.com) (`gemma3:12b`), runnable against a **local Ollama instance** or **Ollama Cloud**.
- **Specialties:** Traumatology, Cardiology, Emergency Medicine.
- **JWT authentication** with short-lived access tokens and `httpOnly` refresh-token cookies; passwords hashed with [Argon2](https://github.com/ranisalt/node-argon2).
- **User progress tracking** completed simulations, average score, survival rate and correct-diagnosis rate.
- **Session history** with cursor-based pagination and full AI review per session.
- **Auto-generated API docs** via Swagger (OpenAPI).
- **PostgreSQL** persistence through [Prisma 7](https://www.prisma.io/) (with the `@prisma/adapter-pg` driver adapter).

---

## Tech Stack

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| Runtime          | Node.js + TypeScript                                  |
| Framework        | [NestJS 11](https://nestjs.com)                       |
| Database         | PostgreSQL 18                                         |
| ORM              | Prisma 7 (`@prisma/adapter-pg`)                       |
| Realtime         | Socket.IO (`@nestjs/websockets` + `platform-socket.io`) |
| AI / LLM         | Ollama (`gemma3:12b`)                                 |
| Auth             | `@nestjs/jwt`, `jsonwebtoken`, Argon2                 |
| Validation       | `class-validator`, `class-transformer`                |
| API Docs         | `@nestjs/swagger`                                     |
| Lint / Format    | [Biome](https://biomejs.dev)                          |
| Testing          | Jest + Supertest                                      |
| Package manager  | pnpm                                                  |

---

## Requirements

Make sure the following are installed before you start:

- **[Node.js](https://nodejs.org/)** v20 or later (matches `@types/node@20`)
- **[pnpm](https://pnpm.io/installation)** v9 or later (`npm install -g pnpm`)
- **[Docker](https://www.docker.com/) & Docker Compose** to run PostgreSQL locally (or bring your own PostgreSQL 18 instance)
- **An LLM backend**, one of:
  - **[Ollama](https://ollama.com/download)** running locally with the `gemma3:12b` model pulled (`ollama pull gemma3:12b`), **or**
  - An **Ollama Cloud** API key (https://ollama.com)

---

## Getting Started

### 1. Clone & install dependencies

```bash
git clone git@github.com:Guraspinho/lifegem-backend.git
cd lifegem-backend
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill in the values:

```bash
cp .env.exampe .env
```

| Variable                | Description                                                                 | Example                                                              |
| ----------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `POSTGRES_DB`           | Database name (used by Docker Compose)                                       | `lifegem_db`                                                         |
| `POSTGRES_USER`         | Database user (used by Docker Compose)                                       | `admin`                                                             |
| `POSTGRES_PASSWORD`     | Database password (used by Docker Compose)                                   | `admin`                                                             |
| `DATABASE_URL`          | Prisma/Postgres connection string                                           | `postgresql://admin:admin@localhost:5432/lifegem_db?schema=public`  |
| `ACCESS_TOKEN_SECRET`   | Secret used to sign JWT access tokens                                        | _(a long random string)_                                             |
| `REFRESH_TOKEN_SECRET`  | Secret used to sign JWT refresh tokens                                       | _(a long random string)_                                             |
| `ACCESS_TOKEN_LIFETIME` | Access-token TTL                                                            | `1h`                                                                |
| `REFRESH_TOKEN_LIFETIME`| Refresh-token TTL                                                          | `14d`                                                               |
| `OLLAMA_API_KEY`        | API key for Ollama Cloud (required when `USE_OLLAMA_CLOUD=true`)             | _(your key)_                                                        |
| `USE_OLLAMA_CLOUD`      | `true` to use Ollama Cloud, otherwise a local Ollama instance is used        | `true`                                                             |
| `PORT`                  | _(optional)_ HTTP port the server listens on (defaults to `3000`)            | `3000`                                                              |
| `FRONTEND_URL`          | _(optional)_ Allowed CORS origin (defaults to `http://localhost:5173`)       | `http://localhost:5173`                                            |
| `NODE_ENV`              | _(optional)_ Set to `production` to enable secure cookies                    | `development`                                                       |

### 3. Start PostgreSQL

```bash
docker compose up -d
```

This spins up a `postgres:18` container (`lifegem-pg`) on port `5432` using the `POSTGRES_*` values from your `.env`.

### 4. Apply database migrations & generate the Prisma client

```bash
pnpm prisma:migrate:dev

pnpm prisma:generate
```

### 5. Run the app

```bash
pnpm start:dev

pnpm start
pnpm start:debug
pnpm start:prod
```

The server starts on [http://localhost:3000](http://localhost:3000) by default.

---

## API Documentation

Once the server is running, interactive Swagger / OpenAPI docs are available at:

```
http://localhost:3000/api-docs
```

### REST endpoints (overview)

| Method | Path                  | Auth          | Description                                          |
| ------ | --------------------- | ------------- | ---------------------------------------------------- |
| `POST` | `/auth/register`      |             | Register a new user                                  |
| `POST` | `/auth/login`         |             | Log in; returns an access token + refresh cookie     |
| `POST` | `/auth/refresh`       | Refresh token | Rotate the access token                              |
| `POST` | `/auth/logout`        | Access token  | Log out and clear the refresh cookie                 |
| `GET`  | `/user`               | Access token  | Get the authenticated user's profile & stats         |
| `GET`  | `/user/sessions`      | Access token  | List the user's sessions (cursor paginated)          |
| `GET`  | `/user/sessions/:id`  | Access token  | Get a single session with its AI review & history    |
| `GET`  | `/health-check`       |             | Liveness probe                                       |

### WebSocket events (Socket.IO)

Connect with an access token in the handshake query (`auth`). Then:

| Event              | Direction       | Purpose                                            |
| ------------------ | --------------- | -------------------------------------------------- |
| `start_session`    | client → server | Start a new simulation for a chosen specialty      |
| `chat_message`     | client → server | Send a message to the AI patient                   |
| `final_diagnosis`  | client → server | Submit the final diagnosis                         |
| `session_end`      | client → server | End the session and trigger the AI review          |

---

## Project Structure

```
src/
├── main.ts                  # App bootstrap (Swagger, CORS, global pipes/filters)
├── app.module.ts            # Root module
├── common/                  # Cross-cutting guards, filters, pipes
│   ├── guards/              # Access/refresh/WS auth guards
│   ├── filters/             # HTTP & WS exception filters
│   └── pipes/               # WS validation pipe
├── core/
│   ├── ai/                  # Ollama integration + prompt builders
│   ├── database/            # Prisma service & provider
│   └── swagger/             # Swagger config
└── modules/
    ├── auth/                # Register / login / refresh / logout
    ├── user/                # Profile & session history
    ├── chat/                # WebSocket gateway + simulation logic
    └── health-check/        # Health endpoint

prisma/
├── schema.prisma            # Data model (Users, Sessions, enums)
└── migrations/              # SQL migration history
```

---

## Useful Scripts

| Script                     | Description                                  |
| -------------------------- | -------------------------------------------- |
| `pnpm build`               | Compile the project with the Nest CLI        |
| `pnpm start:dev`           | Run in watch mode                            |
| `pnpm start:prod`          | Run the compiled output (`node dist/main`)   |
| `pnpm prisma:generate`     | Generate the Prisma client                   |
| `pnpm prisma:migrate:dev`  | Create/apply dev migrations                  |
| `pnpm biome:fix`           | Lint and format the codebase                 |

---

## License

This project is **UNLICENSED**.
