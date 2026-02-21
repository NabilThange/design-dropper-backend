# Use official Playwright image with all dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.57.0-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Install dembrandt globally for CLI access
RUN npm install -g dembrandt

# Copy application code
COPY . .

# Expose port
EXPOSE 10000

# Start the server
CMD ["node", "server.js"]
