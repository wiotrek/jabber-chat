# ---- Base ----
FROM node:22-slim AS base
WORKDIR /app

# ---- Dependencies (incl. devDependencies, needed to compile TS) ----
FROM base AS build-deps
# python3/make/g++ let bcrypt build its native addon if no prebuilt binary matches this image
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM build-deps AS build
COPY . .
RUN npm run build

# ---- Production-only dependencies ----
FROM base AS prod-deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

RUN useradd --no-create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
