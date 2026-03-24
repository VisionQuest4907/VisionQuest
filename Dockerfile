# Use a small Node image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the code
COPY . .

# Set environment
ENV NODE_ENV=production

# Expose API port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
