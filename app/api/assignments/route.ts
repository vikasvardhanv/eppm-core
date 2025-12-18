import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const { activityId, resourceId, plannedUnits } = body;
  
  // Get resource rate
  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  
  // Get activity duration
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  
  // Calculate cost: Units * Duration * Rate
  // Assuming plannedUnits is units/time (e.g. 1.0 = 100%)
  const cost = plannedUnits * activity.originalDuration * resource.unitPrice;

  const assignment = await prisma.assignment.create({
    data: {
      activityId,
      resourceId,
      plannedUnits: Number(plannedUnits),
      remainingUnits: Number(plannedUnits),
      cost
    }
  });
  
  return NextResponse.json(assignment);
}
