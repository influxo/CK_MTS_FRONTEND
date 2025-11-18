# Frontend Docker Compose

This project uses Vite + React. The compose file is simplified to a single service so you can start it with one command.

## Run

```bash
docker compose up -d --build
```

Open: http://localhost:8080

Details:
- Image name: `ck_mts_frontend:latest`
- Host port `8080` maps to container port `4173` (Vite preview).

## Commands

- **Stop services**: `docker compose down`
- **Rebuild after changes**: add `--build`
- **Logs**: `docker compose logs -f`

## Environment variables

If you use runtime env vars, prefer build-time `import.meta.env` with Vite or bake them into the image. For truly runtime injection, consider a small init script that templates a `config.js` loaded by `index.html`.
