FROM node:20-slim

# Install poppler-utils for PDF to image conversion
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend + server
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/plans

EXPOSE 3000
CMD ["node", "dist-server/index.js"]
