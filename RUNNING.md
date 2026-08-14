Run Core Service locally

1. Ensure Docker is running (for Postgres). The repo provides a compose file at `docker-compose.yaml`.

2. Create the `.env` file (already provided) or edit `core-service/.env` to match your environment.

3. From the `core-service` folder run:

```sh
npm install
npm run start:local
```

This will start a local Postgres via Docker Compose, generate the Prisma client, and start the app with `nodemon`.

If you prefer to manage Postgres yourself, start Postgres, ensure `DATABASE_URL` in `.env` is correct, then run:

```sh
npm install
npm run prisma:generate
npm run dev
```

Troubleshooting:
- If you see errors about `JWT_SECRET`, set it in `.env` to the same secret used by `auth-service` or use `dev_jwt_secret` for local testing.
- If Prisma complains about missing migrations, run your migration steps or apply a temporary DB with the expected schema.
