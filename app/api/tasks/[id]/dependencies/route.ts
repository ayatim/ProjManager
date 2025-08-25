import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET task dependencies
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dependencies = await prisma.taskDependency.findMany({
      where: {
        OR: [
          { dependentTaskId: params.id },
          { dependsOnTaskId: params.id }
        ]
      },
      include: {
        dependentTask: {
          select: {
            id: true,
            title: true,
            status: true,
            projectId: true
          }
        },
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            projectId: true
          }
        }
      }
    });
    
    return NextResponse.json({
      dependsOn: dependencies
        .filter(d => d.dependentTaskId === params.id)
        .map(d => d.dependsOnTask),
      dependents: dependencies
        .filter(d => d.dependsOnTaskId === params.id)
        .map(d => d.dependentTask)
    });
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

// POST add dependency
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { dependsOnTaskId } = body;
    
    if (!dependsOnTaskId) {
      return NextResponse.json(
        { error: 'dependsOnTaskId is required' },
        { status: 400 }
      );
    }
    
    // Check if both tasks exist and are in the same project
    const [dependentTask, dependsOnTask] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.id },
        select: { projectId: true }
      }),
      prisma.task.findUnique({
        where: { id: dependsOnTaskId },
        select: { projectId: true }
      })
    ]);
    
    if (!dependentTask || !dependsOnTask) {
      return NextResponse.json(
        { error: 'One or both tasks not found' },
        { status: 404 }
      );
    }
    
    if (dependentTask.projectId !== dependsOnTask.projectId) {
      return NextResponse.json(
        { error: 'Tasks must be in the same project' },
        { status: 400 }
      );
    }
    
    // Check for circular dependency
    const wouldCreateCycle = await checkForCycle(params.id, dependsOnTaskId);
    if (wouldCreateCycle) {
      return NextResponse.json(
        { error: 'This would create a circular dependency' },
        { status: 400 }
      );
    }
    
    // Create the dependency
    const dependency = await prisma.taskDependency.create({
      data: {
        dependentTaskId: params.id,
        dependsOnTaskId
      },
      include: {
        dependsOnTask: true
      }
    });
    
    return NextResponse.json(dependency, { status: 201 });
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}

// DELETE remove dependency
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dependsOnTaskId = searchParams.get('dependsOnTaskId');
    
    if (!dependsOnTaskId) {
      return NextResponse.json(
        { error: 'dependsOnTaskId is required' },
        { status: 400 }
      );
    }
    
    await prisma.taskDependency.deleteMany({
      where: {
        dependentTaskId: params.id,
        dependsOnTaskId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}

// Helper function to check for circular dependencies
async function checkForCycle(
  dependentTaskId: string,
  dependsOnTaskId: string
): Promise<boolean> {
  // If A depends on B, check if B (or any of its dependencies) depends on A
  const visited = new Set<string>();
  const queue = [dependsOnTaskId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    if (currentId === dependentTaskId) {
      return true; // Found a cycle
    }
    
    if (visited.has(currentId)) {
      continue;
    }
    
    visited.add(currentId);
    
    // Get all tasks that the current task depends on
    const dependencies = await prisma.taskDependency.findMany({
      where: { dependentTaskId: currentId },
      select: { dependsOnTaskId: true }
    });
    
    queue.push(...dependencies.map(d => d.dependsOnTaskId));
  }
  
  return false;
}