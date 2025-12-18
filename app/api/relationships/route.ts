import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { predecessorId, successorId, type, lag } = body;
  
  const rel = await prisma.relationship.create({
    data: {
      predecessorId,
      successorId,
      type: type || 'FS',
      lag: Number(lag) || 0
    }
  });
  
  return NextResponse.json(rel);
}
