# idea-hunt-server

Express + MongoDB + Gemini (search grounding) + node-cron, with user auth and role-based access.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, GEMINI_API_KEY, JWT_SECRET, SUPERADMIN_EMAIL/PASSWORD
npm run dev             # or: npm start
```

On first DB connect, if no user with role `superAdmin` exists, one is seeded automatically
from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` in `.env`. Log in with those credentials and
change the password.

## Folder structure

```
src/
  server.js          entrypoint — connects DB, starts Express, starts cron
  app.js             Express app config, route mounting
  config/            env validation, db connection
  models/            User, Idea, RotationState (Mongoose schemas)
  routes/            auth, ideas, harvest
  controllers/        thin HTTP layer
  services/            business logic (gemini, idea, rotation, user)
  jobs/                node-cron registration
  middleware/          auth (JWT), validate (zod), errorHandler, asyncHandler
  utils/                logger, safe JSON parse
  constants/            source rotation list + prompt template
  seed/                 seedSuperAdmin
public/                 static tracker board (fetches from the API)
```

## Auth

- `POST /api/auth/register` — public signup, always role `user`
- `POST /api/auth/login` — returns `{ user, token }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`
- `GET /api/auth/users` — superAdmin only
- `PATCH /api/auth/users/:id/role` — superAdmin only, body `{ "role": "admin" }`

All `/api/ideas` and `/api/harvest` routes require a Bearer token.

## Ideas / harvest

- `POST /api/harvest` — runs today's Gemini search-grounded harvest, rate-limited (5/day)
- `GET /api/ideas?stage=harvest` — list, optional stage filter
- `PATCH /api/ideas/:id` — update stage/score
- `DELETE /api/ideas/:id`

## Notes

- `Idea.source_link` has a unique index — Mongo itself rejects duplicate inserts, so
  `insertMany(..., { ordered: false })` skips only the duplicates, not the whole batch.
- Gemini's grounded search is billed per query the model runs internally — the harvest
  endpoint is rate-limited for that reason.
- Verify the `gemini-2.5-flash` model string in `services/gemini.service.js` is still
  current before deploying; Gemini model names change.
