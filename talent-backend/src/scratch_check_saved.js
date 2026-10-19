const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const saved = await prisma.savedVideo.findMany({
    include: { video: true }
  });
  console.log('COUNT:', saved.length);
  console.log(JSON.stringify(saved, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
