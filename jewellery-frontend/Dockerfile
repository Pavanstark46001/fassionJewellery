# --- Build stage -----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Points the built app at the backend service name inside the Docker network
# (see docker-compose.yml) rather than localhost, which only works when both
# containers share a network and the backend is reachable as "backend".
ARG VITE_API_BASE_URL=http://localhost:8090/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- Run stage ---------------------------------------------------------------
FROM nginx:1.27-alpine AS run

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
