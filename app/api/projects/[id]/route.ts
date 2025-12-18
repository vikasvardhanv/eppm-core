import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      activities: {
        include: {
          predecessors: true,
          successors: true,
          assignments: { include: { resource: true } }
        },
        orderBy: { earlyStart: 'asc' } 
      }
    }
  });
  
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}
