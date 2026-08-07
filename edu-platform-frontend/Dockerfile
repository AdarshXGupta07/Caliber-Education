FROM node:20-alpine

WORKDIR /app

# Copy package configurations
COPY package.json package-lock.json* ./

# Install dependencies (frozen lockfile allows deterministic builds)
RUN npm install

# Copy application files (including .env.local if present)
COPY . .

# Build the Next.js production payload
RUN npm run build

# Expose standard frontend port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
