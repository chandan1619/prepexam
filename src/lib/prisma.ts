import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// SSL configuration for production databases
const getDatabaseConfig = () => {
  const baseConfig = {
    log: process.env.NODE_ENV === 'development' ? ['query' as const] : ['error' as const],
  }

  // In production, ensure SSL is properly configured
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseConfig,
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    }
  }

  return baseConfig
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(getDatabaseConfig())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma