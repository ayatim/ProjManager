import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST move task to different status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, position } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Get the task to find its project
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { projectId: true, status: true }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // If position is not provided, append to end of new column
    let newPosition = position;
    if (newPosition === undefined) {
      const highestPosition = await prisma.task.findFirst({
        where: {
          projectId: task.projectId,
          status
        },
        orderBy: {
          position: 'desc'
        },
        select: {
          position: true
        }
      });
      
      newPosition = (highestPosition?.position ?? -1) + 1;
    }
    
    // Update task status and position
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        status,
        position: newPosition
      },
      include: {
        labels: {
          include: {
            label: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error moving task:', error);
    return NextResponse.json(
      { error: 'Failed to move task' },
      { status: 500 }
    );
  }
}