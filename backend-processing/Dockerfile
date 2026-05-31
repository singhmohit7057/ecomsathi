FROM node:20-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-eng \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install ALL deps (including dev) for build
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Remove dev deps after build
RUN npm prune --omit=dev

EXPOSE 3001
CMD ["node", "dist/server/index.js"]
