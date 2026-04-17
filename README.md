# task-scheduler

## Project Overview

`task-scheduler` is a backend REST API built with TypeScript and NestJS for user registration, login, and task management. The repository uses PostgreSQL and TypeORM and the data model comes directly from the entities defined in code. After logging in, a user receives a JWT token and can perform operations only on their own tasks. Each task contains a title, description, due date, and a status of `OPEN`, `IN_PROGRESS`, or `COMPLETED`. The application exposes endpoints for registration, login, and full CRUD operations for tasks. Input is validated globally with `ValidationPipe`, and user passwords are excluded from responses thanks to `class-transformer`. The repository does not include a separate UI (look at task-sheduler-frontend repository to have UI ready to work), so the application is used through HTTP requests to the `auth` and `tasks` endpoints, for example via Postman or an external frontend. In addition, the backend enables CORS for the origin defined in the `FRONTEND` environment variable, which makes it easier to connect a web client.

## Demo / Recording

A demo recording will be added soon.

- Demo video: [LINK_TO_RECORDING_HERE](TODO)

## Requirements

- Node.js and npm. The repository includes `package-lock.json`, so the default package manager is npm.
- A working PostgreSQL instance available locally or over the network.

## Installation

### Default installation path

```bash
git clone https://github.com/antoni306/task-scheduler.git
cd task-scheduler
npm ci
```

### Alternative

If you cannot use `npm ci`, use:

```bash
npm install
```

### Prepare the PostgreSQL database

1. Start PostgreSQL locally or use an existing instance.
2. Create a database matching the `DATABASE` value from your `.env` file.

Example SQL command:

```sql
CREATE DATABASE <DATABASE_NAME_MATCHING_DATABASE>;
```

## Configuration

The repository **does not include** a `.env.example` file, so after cloning you need to create a `.env` file manually in the project root.

Example `.env` content based only on variables used in the code:

```env
HOST_DB='localhost'
PORT_DB=5432
USERNAME_DB=<POSTGRES_USERNAME>
PASSWORD_DB=<POSTGRES_PASSWORD>
DATABASE=<DATABASE_NAME>
JWT_SECRET=<LONG_RANDOM_SECRET>
PORT=3000


Notes:

- Set `JWT_SECRET` to your own long, random string.
- Tables will be created or synchronized automatically on startup because TypeORM is configured with `synchronize: true`.




```

## Running the App

1. Make sure PostgreSQL is running and that the database specified in `DATABASE` already exists.
2. Make sure the `.env` file is present in the project root.
3. Start the backend in development mode:

```bash
npm run start:dev
```

After a successful startup, the API should be available at:

```text
http://localhost:3000
```

If you set a different `PORT` value, use that port instead of `3000`.

Main endpoints:

- `POST /auth/register` — register a user
- `POST /auth/login` — log in and get a JWT token
- `POST /tasks` — create a task, requires a Bearer token
- `GET /tasks` — get the current user's task list, requires a Bearer token
- `GET /tasks/:id` — get a single task, requires a Bearer token
- `PATCH /tasks/:id` — update a task, requires a Bearer token
- `DELETE /tasks/:id` — delete a task, requires a Bearer token

The typical flow is: register a user, log in to receive an `access_token`, and then send the `Authorization: Bearer <token>` header with requests to `/tasks`.

```

```
