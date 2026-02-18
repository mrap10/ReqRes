FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
COPY apps/runner/package.json ./apps/runner/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cd apps/runner && bun build index.ts --outdir ./dist

FROM base
ENV NODE_ENV=production

# docker CLI needed to spawn sandbox containers for user code execution
RUN apk add --no-cache docker-cli

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/runner ./apps/runner

WORKDIR /app/apps/runner
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:${PORT:-5000}/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "dist/index.js"]
