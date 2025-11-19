## Development setup

1. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Start the backend:
   ```bash
   cd server
   npm run dev
   ```
   - Set `USE_IN_MEMORY_DB=true` in `server/.env` (or the shell) to skip the Atlas cluster and boot with an in-memory MongoDB instance for local testing.
   - If you use the Atlas cluster, make sure your current IP is added to the project's allowlist or the connection will fail with `ECONNREFUSED`.
3. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```
   The Vite dev server proxies `/api/*` to `http://localhost:4000`, so the backend must be running first to avoid proxy errors.

## Troubleshooting

- **`[vite] http proxy error`**: The backend at `http://localhost:4000` is not reachable. Start the server (see above) or ensure the port matches `client/vite.config.js`.
- **MongoDB connection errors**: Either whitelist your IP in Atlas or set `USE_IN_MEMORY_DB=true` to fall back to the embedded MongoDB Memory Server for local-only development.

## AI receipt extraction

1. Set the Gemini API key in `server/.env` (Gemini 2.5 Image Flash is the default):
   ```
   GEMINI_API_KEY=AIzaSyCc6vDHAfK2ZAVXC9FCUD8a7ofa7Z5gCQ4
   GEMINI_MODEL=gemini-2.0-flash-exp   # optional override (2.5 Image Flash)
   ```
2. Start the backend and frontend. In the dashboard, use **“Import from receipt or PDF”** to upload JPG/PNG/PDF files (up to 6 MB).
3. Gemini analyzes the document, extracts expense line items, and the UI lets you add each detected transaction into your ledger.
