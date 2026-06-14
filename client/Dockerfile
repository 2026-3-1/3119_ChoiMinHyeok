# Stage 1: Build React
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_TOSS_CLIENT_KEY
ARG VITE_SENTRY_DSN

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TOSS_CLIENT_KEY=$VITE_TOSS_CLIENT_KEY
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

# Stage 2: Nginx로 서빙
FROM nginx:1.28-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
