# Use the latest LTS version of Node.js as the base image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies using npm ci for a clean, reproducible install
RUN npm ci --omit=dev

# Copy the entire project files into the container
COPY . .

# Expose port 5000
EXPOSE 5000

# Ensure PostgreSQL is available inside the container
RUN apt-get update && apt-get install -y postgresql-client

# Set the default command to run the application
CMD ["node", "server.js"]
