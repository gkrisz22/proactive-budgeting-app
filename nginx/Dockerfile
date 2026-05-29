# Stage 1: Build the React SPA
FROM node:20-slim AS builder
WORKDIR /app
# Copy only package files first to cache npm install
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*
# Copy the static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy your custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80