import { PrismaClient } from '@prisma/client';
import { mockUser } from './mockUser';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: mockUser,
  });
  console.log('Mock user created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect(); // ✅ ESLint-compliant
  });
