import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.costCode !== undefined) data.costCode = body.costCode;
  if (body.wbsCode !== undefined) data.wbsCode = body.wbsCode;
  if (body.originalDuration !== undefined) data.originalDuration = Number(body.originalDuration);
  
  if (body.percentComplete !== undefined) {
    data.percentComplete = Number(body.percentComplete);
    let status = 'NOT_STARTED';
    if (data.percentComplete > 0) status = 'IN_PROGRESS';
    if (data.percentComplete === 100) status = 'COMPLETED';
    data.status = status;
  }
  
  if (body.remainingDuration !== undefined) {
    data.remainingDuration = Number(body.remainingDuration);
  }
  
  const activity = await prisma.activity.update({
    where: { id },
    data
  });

  await prisma.auditLog.create({
    data: {
      entityId: activity.id,
      entityType: 'ACTIVITY',
      action: 'UPDATE',
      details: `Updated fields: ${Object.keys(data).join(', ')}`
    }
  });
  
  return NextResponse.json(activity);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.activity.delete({
    where: { id }
  });

  await prisma.auditLog.create({
    data: {
      entityId: id,
      entityType: 'ACTIVITY',
      action: 'DELETE',
      details: 'Deleted activity'
    }
  });

  return NextResponse.json({ success: true });
}
