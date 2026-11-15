# Bloom Filter Backend

This directory contains the NestJS API, Prisma schema and migrations, unit specs, and Bloom Filter experiments. For the project overview and Docker run instructions, see the [project README](../README.md).

## Local development

Provide a `backend/.env` based on `.env.example`. The local defaults expect PostgreSQL at `localhost:5433` and Redis at `localhost:6380`; the supplied Compose file exposes those ports. Install dependencies, apply migrations, and start NestJS:

```bash
npm ci
npx prisma migrate deploy
npm run start:dev
```

Swagger UI: <http://localhost:3000/api/docs>. The HTTP routes are prefixed with `/api/v1`.

## Useful commands

```bash
npm run build
npm test
npm run test:e2e
npm run test:cov
npx ts-node src/bloom-filter/experiments/scale-test.ts
npx ts-node src/bloom-filter/experiments/rebuild.ts
```

The rebuild command replaces Redis Bloom Filter state using PostgreSQL data. Coordinate it with API traffic; the project does not implement distributed rebuild locking or automatic recovery.

## Code map

- `src/bloom-filter/`: in-memory filter, hashing, Redis-backed adapter, and experiments.
- `src/users/`: availability and signup endpoints plus DTO validation.
- `src/redis/`: ioredis client lifecycle and connection-loss flag.
- `src/prisma/`: Prisma client lifecycle.
- `prisma/`: schema and migration history.
- `test/` and `src/**/*.spec.ts`: existing end-to-end and unit specs.
