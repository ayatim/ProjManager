import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create labels
  const labels = await Promise.all([
    prisma.label.upsert({
      where: { name: 'bug' },
      update: {},
      create: { name: 'bug', color: '#EF4444' }
    }),
    prisma.label.upsert({
      where: { name: 'feature' },
      update: {},
      create: { name: 'feature', color: '#10B981' }
    }),
    prisma.label.upsert({
      where: { name: 'enhancement' },
      update: {},
      create: { name: 'enhancement', color: '#3B82F6' }
    }),
    prisma.label.upsert({
      where: { name: 'documentation' },
      update: {},
      create: { name: 'documentation', color: '#F59E0B' }
    }),
    prisma.label.upsert({
      where: { name: 'ui' },
      update: {},
      create: { name: 'ui', color: '#8B5CF6' }
    }),
    prisma.label.upsert({
      where: { name: 'backend' },
      update: {},
      create: { name: 'backend', color: '#14B8A6' }
    }),
    prisma.label.upsert({
      where: { name: 'security' },
      update: {},
      create: { name: 'security', color: '#EC4899' }
    }),
  ]);

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      color: '#3B82F6',
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build native mobile application',
      color: '#10B981',
    }
  });

  // Create tasks for project 1
  const task1 = await prisma.task.create({
    data: {
      title: 'Design homepage mockup',
      description: 'Create initial design concepts for the new homepage',
      projectId: project1.id,
      status: 'todo',
      priority: 'high',
      assignee: 'JD',
      position: 0,
      labels: {
        create: [
          { labelId: labels.find(l => l.name === 'ui')!.id },
          { labelId: labels.find(l => l.name === 'feature')!.id }
        ]
      }
    }
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement authentication',
      description: 'Set up user authentication system with JWT',
      projectId: project1.id,
      status: 'in-progress',
      priority: 'high',
      assignee: 'AB',
      position: 0,
      labels: {
        create: [
          { labelId: labels.find(l => l.name === 'backend')!.id },
          { labelId: labels.find(l => l.name === 'security')!.id }
        ]
      }
    }
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Write API documentation',
      description: 'Document all API endpoints with examples',
      projectId: project1.id,
      status: 'in-progress',
      priority: 'medium',
      assignee: 'CD',
      position: 1,
      labels: {
        create: [
          { labelId: labels.find(l => l.name === 'documentation')!.id }
        ]
      }
    }
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Fix responsive layout issues',
      description: 'Address mobile layout problems on product pages',
      projectId: project1.id,
      status: 'review',
      priority: 'medium',
      assignee: 'EF',
      position: 0,
      labels: {
        create: [
          { labelId: labels.find(l => l.name === 'bug')!.id },
          { labelId: labels.find(l => l.name === 'ui')!.id }
        ]
      }
    }
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Deploy to staging',
      description: 'Deploy latest changes to staging environment',
      projectId: project1.id,
      status: 'done',
      priority: 'low',
      assignee: 'GH',
      position: 0,
    }
  });

  // Create tasks for project 2
  const task6 = await prisma.task.create({
    data: {
      title: 'Setup React Native project',
      description: 'Initialize React Native with TypeScript',
      projectId: project2.id,
      status: 'done',
      priority: 'high',
      assignee: 'JD',
      position: 0,
    }
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Implement push notifications',
      description: 'Add push notification support for iOS and Android',
      projectId: project2.id,
      status: 'todo',
      priority: 'medium',
      assignee: 'AB',
      position: 0,
      labels: {
        create: [
          { labelId: labels.find(l => l.name === 'feature')!.id }
        ]
      }
    }
  });

  // Create task dependencies
  // Task 3 (API documentation) depends on Task 2 (authentication)
  await prisma.taskDependency.create({
    data: {
      dependentTaskId: task3.id,
      dependsOnTaskId: task2.id,
    }
  });

  // Task 5 (deploy) depends on Task 4 (fix responsive)
  await prisma.taskDependency.create({
    data: {
      dependentTaskId: task5.id,
      dependsOnTaskId: task4.id,
    }
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });