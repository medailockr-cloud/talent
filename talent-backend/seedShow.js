
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    const show = await prisma.show.create({
      data: {
        title: 'Secret Living Room Acoustic Session',
        location: 'Bengaluru, India',
        date: new Date('2026-11-16T19:30:00Z'),
        image: 'https://images.unsplash.com/photo-1540039155733-d7696d4eb98e?w=800',
        hostId: user.id
      }
    });
    console.log('Created show', show);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

