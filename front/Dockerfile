# =========================
# Build stage
# =========================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .
RUN npm run build --configuration=production

# =========================
# Runtime stage (Nginx)
# =========================
FROM nginx:alpine

# REMOVE default nginx html
RUN rm -rf /usr/share/nginx/html/*

# 🔑 IMPORTANT: copy ONLY browser output
COPY --from=build /app/dist/front/browser /usr/share/nginx/html

# Replace nginx config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
