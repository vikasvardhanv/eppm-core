import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tasks = await prisma.activity.findMany({
    where: {
      status: { not: 'COMPLETED' }
    },
    include: {
      project: { select: { name: true } }
    },
    orderBy: { earlyStart: 'asc' }
  });
  return NextResponse.json(tasks);
}
