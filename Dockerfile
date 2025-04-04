FROM node:16-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache mysql-client bash

# Copy package.json files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY . .

# Ensure the directory exists
RUN mkdir -p /app/src/.seed_data && \
    chmod +x docker-entrypoint.sh

EXPOSE 8080

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"] 