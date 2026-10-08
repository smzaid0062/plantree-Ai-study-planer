#-------------Frontend Dockerfile-----------------

#-------------Stage 1: Build the React/Vite App-----------------
FROM node:24-alpine AS build

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application sources
COPY . .

# Create production build
RUN npm run build

#-------------Stage 2: Serve the React/Vite App-----------------
FROM nginx:alpine AS production

# Copy Vite production build
COPY --from=build /app/dist /usr/share/nginx/html


# EXPOSE Nginx HTTP port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]