# Stage 1
FROM node:18-alpine3.17 as build-step

WORKDIR /app

COPY ./ /app

RUN npm install
RUN npm run build -- --output-path=./dist/out

# Stage 2
FROM nginx:stable-alpine

COPY --from=build-step /app/dist/out/ /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/

CMD ["nginx", "-g", "daemon off;"]
