import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const baselines = await prisma.baseline.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(baselines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch baselines' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Fetch current project state
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        activities: {
            include: {
                assignments: true,
                predecessors: true,
                successors: true
            }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create baseline with snapshot of data
    const baseline = await prisma.baseline.create({
      data: {
        projectId: id,
        name: body.name || `Baseline - ${new Date().toLocaleDateString()}`,
        data: JSON.stringify(project)
      }
    });

    return NextResponse.json(baseline);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create baseline' }, { status: 500 });
  }
}
