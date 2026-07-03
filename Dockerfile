# Multi-stage Dockerfile for Causal Impact Platform
# Bundles Node.js (Next.js) + Python (pycausalimpact) in a single image
# Works on Render, Fly.io, Koyeb, or any container host

# ---------- Stage 1: Build the Next.js app ----------
FROM node:20-slim AS builder

WORKDIR /app

# Install bun for the build (matches the dev environment)
RUN npm install -g bun

# Copy dependency manifests first for better layer caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build the production standalone output
RUN bun run build

# ---------- Stage 2: Production runtime ----------
FROM node:20-slim AS runner

WORKDIR /app

# Install Python 3 and pip — needed for the causal analysis subprocess
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create a Python venv and install the analysis dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir pycausalimpact pandas statsmodels scipy

# Copy the standalone Next.js build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy the Python analysis scripts
COPY --from=builder /app/scripts ./scripts

# Copy package.json (needed for the start script)
COPY --from=builder /app/package.json ./package.json

# The API route spawns Python at /usr/bin/python3 — make sure it can find it
# The venv is on PATH so `python3` resolves to the venv's python
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Health check — verify the server responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the Next.js standalone server
CMD ["node", "server.js"]
