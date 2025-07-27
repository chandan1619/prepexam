const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('Setting up test data...');

    // Create a test course
    const course = await prisma.exam.upsert({
      where: { slug: 'test-course' },
      update: {},
      create: {
        title: 'Test Course with Mixed Content',
        slug: 'test-course',
        description: 'A test course with both free and premium modules',
        category: 'Test',
        level: 'Beginner',
        duration: '4 weeks',
        priceInINR: 999,
        isPublished: true,
      },
    });

    console.log('Created course:', course.title);

    // Create modules - first one free, rest paid
    const modules = [
      {
        title: 'Introduction (Free)',
        description: 'Free introductory module',
        isFree: true,
        order: 0,
      },
      {
        title: 'Advanced Concepts (Premium)',
        description: 'Advanced concepts requiring payment',
        isFree: false,
        order: 1,
      },
      {
        title: 'Expert Level (Premium)',
        description: 'Expert level content requiring payment',
        isFree: false,
        order: 2,
      },
    ];

    for (const moduleData of modules) {
      // Check if module already exists
      const existingModule = await prisma.module.findFirst({
        where: {
          examId: course.id,
          title: moduleData.title
        }
      });

      const module = existingModule || await prisma.module.create({
        data: {
          ...moduleData,
          examId: course.id,
        },
      });

      console.log('Created module:', module.title);

      // Add some sample content to each module
      const existingBlogPost = await prisma.blogPost.findFirst({
        where: {
          moduleId: module.id,
          title: `${moduleData.title} - Lesson 1`
        }
      });

      if (!existingBlogPost) {
        await prisma.blogPost.create({
          data: {
            moduleId: module.id,
            title: `${moduleData.title} - Lesson 1`,
            slug: `${moduleData.title.toLowerCase().replace(/\s+/g, '-')}-lesson-1-${Date.now()}`,
            content: `<h2>Welcome to ${moduleData.title}</h2><p>This is sample content for ${moduleData.title}.</p>`,
            excerpt: `Sample lesson for ${moduleData.title}`,
            isFree: moduleData.isFree,
            isPublished: true,
          },
        });
      }
    }

    console.log('Test data setup complete!');
    console.log('You can now test the enrollment and payment flow with the test course.');
    
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();