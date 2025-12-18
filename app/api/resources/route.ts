import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        role: true
      }
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const resource = await prisma.resource.create({
    data: {
      name: body.name,
      type: body.type || 'LABOR',
      unitPrice: Number(body.unitPrice) || 0,
      maxUnits: Number(body.maxUnits) || 1.0,
      roleId: body.roleId || null
    },
    include: {
      role: true
    }
  });
  return NextResponse.json(resource);
}
