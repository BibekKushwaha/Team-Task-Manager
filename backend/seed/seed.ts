import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });

  console.log('✅ Users created');

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'MEMBER' },
          { userId: member2.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for task management',
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: 'ADMIN' },
          { userId: member1.id, role: 'ADMIN' },
        ],
      },
    },
  });

  console.log('✅ Projects created');

  // Create tasks
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      // Project 1 tasks
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockups for the new homepage',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: yesterday,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a mobile-friendly navigation component with hamburger menu',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: tomorrow,
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: nextWeek,
        projectId: project1.id,
        assignedToId: admin.id,
        createdById: admin.id,
      },
      {
        title: 'Write unit tests for components',
        description: 'Achieve 80% test coverage for all React components',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: nextWeek,
        projectId: project1.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Optimize images and assets',
        description: 'Compress images and implement lazy loading',
        status: 'TODO',
        priority: 'LOW',
        dueDate: nextWeek,
        projectId: project1.id,
        assignedToId: member2.id,
        createdById: admin.id,
      },
      {
        title: 'Review SEO metadata',
        description: 'Update meta tags, Open Graph data, and sitemap',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: yesterday,
        projectId: project1.id,
        assignedToId: admin.id,
        createdById: member1.id,
      },
      // Project 2 tasks
      {
        title: 'Set up React Native project',
        description: 'Initialize the React Native project with TypeScript template',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: yesterday,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Design app navigation flow',
        description: 'Create navigation structure with React Navigation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: tomorrow,
        projectId: project2.id,
        assignedToId: admin.id,
        createdById: admin.id,
      },
      {
        title: 'Implement authentication screens',
        description: 'Build login and signup screens with form validation',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: nextWeek,
        projectId: project2.id,
        assignedToId: member1.id,
        createdById: admin.id,
      },
      {
        title: 'Build task list component',
        description: 'Create a scrollable, filterable task list with swipe actions',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: nextWeek,
        projectId: project2.id,
        assignedToId: admin.id,
        createdById: member1.id,
      },
    ],
  });

  console.log('✅ Tasks created');
  console.log('');
  console.log('🎉 Seed completed! Test accounts:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  Member: jane@example.com / member123');
  console.log('  Member: john@example.com / member123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
