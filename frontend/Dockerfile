# ---- Build ----
FROM node:24.21.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime ----
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist/jabber-chat/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
