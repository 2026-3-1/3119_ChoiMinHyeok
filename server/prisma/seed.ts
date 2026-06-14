import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@sec101.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
const ADMIN_NAME = 'Root Admin';

async function main() {
  const existing = await prisma.users.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existing) {
    await prisma.users.update({
      where: { email: ADMIN_EMAIL },
      data: { role: 'ADMIN', password: passwordHash },
    });
    console.log(`[seed] Admin user updated: ${ADMIN_EMAIL}`);
  } else {
    await prisma.users.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`[seed] Admin user created: ${ADMIN_EMAIL}`);
  }

  console.log(`[seed] Credentials → email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
