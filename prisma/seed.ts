import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.create({
    data: {
      name: 'Demo Construction Project',
      description: 'A sample project to demonstrate EPPM capabilities',
      startDate: new Date(),
      status: 'ACTIVE',
      activities: {
        create: [
          { name: 'Site Preparation', originalDuration: 40, type: 'TASK_DEPENDENT', earlyStart: new Date(), earlyFinish: new Date() },
          { name: 'Foundation', originalDuration: 80, type: 'TASK_DEPENDENT' },
          { name: 'Framing', originalDuration: 120, type: 'TASK_DEPENDENT' },
          { name: 'Roofing', originalDuration: 60, type: 'TASK_DEPENDENT' },
          { name: 'Plumbing', originalDuration: 80, type: 'TASK_DEPENDENT' },
          { name: 'Electrical', originalDuration: 80, type: 'TASK_DEPENDENT' },
          { name: 'Inspection', originalDuration: 0, type: 'FINISH_MILESTONE' }
        ]
      }
    }
  });

  console.log({ project });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
