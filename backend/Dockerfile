FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for types)
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

# Use npx to run ts-node from local node_modules
CMD ["npx", "ts-node", "src/server.ts"]
