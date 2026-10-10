FROM node:20-alpine AS base

# Install dependensi yang dibutuhkan, termasuk OpenSSL untuk Prisma
RUN apk add --no-cache libc6-compat openssl

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app

# Copy node_modules dan source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (Production Server)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy file public yang tidak ter-compile ke dalam build output
COPY --from=builder /app/public ./public

# Setup folder cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output yang dihasilkan oleh output: 'standalone' di next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Opsional: Jika Anda ingin menjalankan migrasi di container (kurang direkomendasikan di prod)
# COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
