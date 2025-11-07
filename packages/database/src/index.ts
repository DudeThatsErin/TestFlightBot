import { PrismaClient } from './generated/client';

export * from './prisma';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export * from './generated/client';

// Export types
export type { Prisma } from './generated/client';

// Export enums
export { Role, TestflightStatus } from './generated/client';

// Export models
export type { User, Session, TestflightBuild, TestflightBuildLog } from './generated/client';
