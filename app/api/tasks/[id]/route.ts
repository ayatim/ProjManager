import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        labels: {
          include: {
            label: true
          }
        },
        dependsOn: {
          include: {
            dependsOnTask: true
          }
        },
        dependents: {
          include: {
            dependentTask: true
          }
        }
      }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      status,
      priority,
      assignee,
      dueDate,
      position,
      labels
    } = body;
    
    // If status is changing, we need to handle position
    let updateData: any = {
      title,
      description,
      priority,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : null
    };
    
    if (status !== undefined) {
      updateData.status = status;
      
      // If position is not provided, append to end of new column
      if (position === undefined) {
        const highestPosition = await prisma.task.findFirst({
          where: {
            projectId: body.projectId,
            status
          },
          orderBy: {
            position: 'desc'
          },
          select: {
            position: true
          }
        });
        
        updateData.position = (highestPosition?.position ?? -1) + 1;
      } else {
        updateData.position = position;
      }
    }
    
    // Update labels if provided
    if (labels !== undefined) {
      // Remove all existing labels and add new ones
      await prisma.taskLabel.deleteMany({
        where: { taskId: params.id }
      });
      
      if (labels.length > 0) {
        await prisma.taskLabel.createMany({
          data: labels.map((labelId: string) => ({
            taskId: params.id,
            labelId
          }))
        });
      }
    }
    
    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        labels: {
          include: {
            label: true
          }
        }
      }
    });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}