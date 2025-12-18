import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  
  const activity = await prisma.activity.create({
    data: {
      projectId: id,
      name: body.name,
      originalDuration: Number(body.originalDuration),
      remainingDuration: Number(body.originalDuration),
      type: body.type || 'TASK_DEPENDENT'
    }
  });

  await prisma.auditLog.create({
    data: {
      entityId: activity.id,
      entityType: 'ACTIVITY',
      action: 'CREATE',
      details: `Created activity: ${activity.name}`
    }
  });
  
  return NextResponse.json(activity);
}
