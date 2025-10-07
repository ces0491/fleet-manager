import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');

    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      console.log('PostgreSQL connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      console.log('PostgreSQL connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default prisma;
