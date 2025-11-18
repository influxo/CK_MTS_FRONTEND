# Vite Host Allowlist Update

Date: 2025-11-18

- Added `allowedHosts: ["databaza.caritaskosova.org"]` to both `server` and `preview` in `vite.config.ts`.
- This resolves the Vite preview error: "Blocked request. This host is not allowed."

## How to apply

```bash
# Rebuild and restart the container
docker compose up -d --build

# Open
http://localhost:8080
# or access via your domain: https://databaza.caritaskosova.org
```

## Notes
- We use Vite preview for production in Docker. If you later move to a static server (e.g., Nginx/CDN), this host allowlist is not required.
