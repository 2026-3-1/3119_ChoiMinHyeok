const { PrismaClient } = require('../prisma/generated/prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

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
  console.log('Admin created:', user.email, '| role:', user.role, '| id:', user.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
