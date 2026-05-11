import * as bcrypt from 'bcrypt';
import prisma from '../prisma/prisma.client';

async function main() {
  const hash = await bcrypt.hash('admin1234!', 10);
  const user = await prisma.users.upsert({
    where: { email: 'admin@sec101.dev' },
    update: { role: 'ADMIN', password: hash },
    create: {
      email: 'admin@sec101.dev',
      password: hash,
      name: '관리자',
      role: 'ADMIN',
    },
  });
  console.log(`Admin ready — email: ${user.email} | role: ${user.role} | id: ${user.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
