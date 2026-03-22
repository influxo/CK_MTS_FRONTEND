# Multi-stage build for Vite React app
FROM node:20-alpine
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Expose Vite preview port
EXPOSE 4173

ENV HOST=0.0.0.0
ENV PORT=4173

# Serve the built app using Vite's preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
