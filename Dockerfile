FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies only once so layers can be cached.
FROM base AS deps
COPY package*.json ./
# Use --force to work around known peer conflicts in this repo
RUN npm install --force

# Build the Next.js application and generate the Prisma client.
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build
RUN npm prune --omit=dev --force && npm cache clean --force

# Slim runtime image with only what is needed to run the app.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Prisma requires OpenSSL present in the runtime image.
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
