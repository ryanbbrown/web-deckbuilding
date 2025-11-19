# Dockerfile for Fly.io deployment
# Optimized for Fly.io's infrastructure and container orchestration

# Use Debian-based Node.js for better compatibility with native modules
FROM public.ecr.aws/docker/library/node:20-bullseye

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Make port 3002 available outside this container
EXPOSE 3002

# Command execution is handled at runtime via fly.toml process definitions
