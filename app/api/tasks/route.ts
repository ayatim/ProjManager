import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all tasks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const label = searchParams.get('label');
    
    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (label) {
      where.labels = {
        some: {
          label: {
            name: label
          }
        }
      };
    }
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        labels: {
          include: {
            label: true
          }
        },
        dependsOn: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        },
        dependents: {
          include: {
            dependentTask: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' }
      ]
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      projectId, 
      status = 'todo',
      priority = 'medium',
      assignee,
      dueDate,
      labels = []
    } = body;
    
    if (!title || !projectId) {
      return NextResponse.json(
        { error: 'Title and projectId are required' },
        { status: 400 }
      );
    }
    
    // Get the highest position in the target status column
    const highestPosition = await prisma.task.findFirst({
      where: {
        projectId,
        status
      },
      orderBy: {
        position: 'desc'
      },
      select: {
        position: true
      }
    });
    
    const position = (highestPosition?.position ?? -1) + 1;
    
    // Create task with labels
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status,
        priority,
        assignee,
        dueDate: dueDate ? new Date(dueDate) : null,
        position,
        labels: {
          create: labels.map((labelId: string) => ({
            label: {
              connect: { id: labelId }
            }
          }))
        }
      },
      include: {
        labels: {
          include: {
            label: true
          }
        }
      }
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}