# PhishBuster — AI-Assisted Phishing URL Detection

A full-stack web application that combines heuristic analysis and AI-powered classification to detect phishing URLs with confidence scoring and threat logging capabilities.

## Overview

PhishBuster provides a modern interface for analyzing suspicious URLs with two complementary detection methods:
- **Heuristic Analysis**: Fast pattern-based detection using URL structural analysis
- **AI Classification**: Intelligent ML-based detection with confidence scores
- **Threat Logging**: Blockchain-simulated threat event tracking and dashboard visualization

## Tech Stack

### Frontend
- **React 19** — Component-based UI
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **React Router v7** — Client-side routing (Home, Dashboard pages)
- **Axios** — HTTP client for API communication

### Backend
- **Node.js** — JavaScript runtime
- **Express** — Web framework
- **Helmet** — Security headers middleware
- **CORS** — Cross-origin resource sharing support
- **Express Rate Limiter** — Abuse prevention (60 req/min per IP)
- **dotenv** — Environment configuration

## Project Structure

```
phish-buster/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation header
│   │   ├── RiskIndicators.jsx   # Risk display component
│   │   ├── PhishingAlert.jsx    # Alert/warning component
│   │   ├── ResultCard.jsx       # Result presentation
│   │   └── DonutChart.jsx       # Visualization charts
│   ├── pages/
│   │   ├── HomePage.jsx         # Main analyzer page
│   │   └── DashboardPage.jsx    # Threat log dashboard
│   ├── hooks/
│   │   └── useAnalyzer.js       # Custom hook for analysis state
│   ├── App.jsx                  # Router setup
│   ├── main.jsx                 # Entry point
│   ├── api.js                   # Axios API client
│   ├── App.css                  # App styles
│   └── index.css                # Global styles
├── server/                        # Node.js backend
│   ├── routes/
│   │   ├── analyze.js           # Heuristic analysis endpoint
│   │   ├── aiCheck.js           # AI classification endpoint
│   │   └── log.js               # Threat logging endpoints
│   ├── services/
│   │   ├── heuristic.js         # Pattern-based detection logic
│   │   ├── ai.service.js        # AI model integration
│   │   └── risk.js              # Risk scoring utilities
│   ├── server.js                # Express app setup
│   ├── package.json             # Backend dependencies
│   └── .env                     # Backend configuration
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js               # Vite configuration
├── eslint.config.js             # Linting rules
├── package.json                 # Frontend dependencies
└── .gitignore                   # Git exclusions
```

## API Endpoints

### Analysis
- **POST `/analyze`** — Heuristic URL analysis
  - Request: `{ "url": "string" }`
  - Response: `{ "score": number, ... }`

- **POST `/ai-check`** — AI-powered classification
  - Request: `{ "url": "string" }`
  - Response: `{ "label": "phishing|safe", "confidence": number, ... }`

### Logging
- **POST `/log`** — Log a threat event
  - Request: `{ "url": "string", "timestamp": "ISO-8601", ... }`
  - Response: `{ "id": "uuid", ... }`

- **GET `/log`** — Fetch all logged threats
  - Response: `{ "logs": [...] }`

### Health
- **GET `/health`** — Server status check
  - Response: `{ "status": "ok", "ts": "ISO-8601" }`

## Getting Started

### Prerequisites
- **Node.js** 18+ and **pnpm** (or npm/yarn)

### Installation

1. **Clone and navigate**
   ```bash
   cd phish-buster
   ```

2. **Install dependencies**
   ```bash
   # Root (frontend)
   pnpm install
   
   # Backend
   cd server
   pnpm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   # Backend config (server/.env)
   cp server/.env.example server/.env
   # Edit server/.env to set PORT, CLIENT_ORIGIN, API keys, etc.
   ```

### Development

**Terminal 1 — Start the backend**
```bash
cd server
pnpm start
# Server runs on http://localhost:4000
```

**Terminal 2 — Start the frontend**
```bash
pnpm dev
# Frontend runs on http://localhost:5173
# Vite proxy forwards /api requests to http://localhost:4000
```

Visit **http://localhost:5173** in your browser.

### Production Build

```bash
# Build frontend bundle
pnpm build

# Preview production build locally
pnpm preview
```

Output is in the `dist/` directory.

## Scripts

### Frontend
- `pnpm dev` — Start Vite dev server
- `pnpm build` — Build for production
- `pnpm lint` — Run ESLint
- `pnpm preview` — Preview production build

### Backend
- `pnpm start` — Start Express server (from `server/` directory)

## Security Features

- **Helmet.js**: Sets secure HTTP headers (CSP, X-Frame-Options, etc.)
- **CORS**: Whitelist-based origin validation (configurable via `.env`)
- **Rate Limiting**: 60 requests/minute per IP to prevent abuse
- **JSON Size Limit**: 10KB max body to prevent large payloads
- **Environment Secrets**: API keys and credentials via `.env`

## Configuration

### Backend Environment (server/.env)
```env
PORT=4000                          # Server port
CLIENT_ORIGIN=http://localhost:5173 # Frontend origin for CORS
# Add API keys, database URLs, model endpoints as needed
```

### Frontend Proxy (vite.config.js)
- Automatically proxies `/api/*` requests to `http://localhost:4000`
- Configured for development; production uses absolute URLs or CDN

## Testing & Linting

```bash
# Lint frontend code
pnpm lint

# Add tests with your preferred framework (Jest, Vitest, etc.)
```

## Contributing

1. Follow existing code style (ESLint checks)
2. Keep commits focused and descriptive
3. Test changes locally before submitting
4. Update this README if adding major features

## License

[Add your license here]

## Support

For issues, questions, or suggestions, please open an issue or contact the maintainers.

---

**PhishBuster** — Making the web safer, one URL at a time.
