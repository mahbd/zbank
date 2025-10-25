FROM node:lts

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (ignore peer conflicts)
RUN npm install --legacy-peer-deps

# Copy the rest of the project including Prisma schema
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Set the Next.js application to listen on port 3005 inside the container.
# This environment variable tells Next.js where to listen.
ENV PORT 3005

# Expose the configured internal port (3005)
EXPOSE 3005

# Command to run migrations and then start the app
# 'npm start' will now launch the app on the new PORT (3005)
CMD npx prisma migrate deploy && npm start
