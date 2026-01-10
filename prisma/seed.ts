import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@meos.io' },
    update: {},
    create: {
      email: 'demo@meos.io',
      username: 'demo',
      name: 'Demo User',
      password: hashedPassword,
      desktop: {
        create: {
          backgroundPosition: 'cover',
          items: {
            create: [
              {
                label: 'About Me',
                thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                positionX: 15,
                positionY: 20,
                order: 0,
                windowTitle: 'About Me',
                windowSubtitle: 'Designer & Developer',
                windowDescription: 'Welcome to my personal desktop! I\'m a creative developer passionate about building beautiful digital experiences.\n\nThis is MeOS - a personal web operating system where you can showcase your work, projects, and connect with others.',
                windowDetails: [
                  { label: 'Location', value: 'San Francisco, CA' },
                  { label: 'Experience', value: '5+ years' },
                  { label: 'Specialty', value: 'UI/UX Design' },
                ],
                windowLinks: [
                  { label: 'Portfolio', url: 'https://example.com' },
                  { label: 'LinkedIn', url: 'https://linkedin.com' },
                ],
              },
              {
                label: 'Projects',
                thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
                positionX: 30,
                positionY: 20,
                order: 1,
                windowTitle: 'My Projects',
                windowSubtitle: 'Recent Work',
                windowDescription: 'A collection of my recent projects spanning web development, mobile apps, and design systems.\n\nEach project represents countless hours of dedication to craft and attention to detail.',
                windowDetails: [
                  { label: 'Active Projects', value: '12' },
                  { label: 'Completed', value: '47' },
                ],
                windowLinks: [
                  { label: 'View All', url: 'https://github.com' },
                ],
              },
              {
                label: 'Contact',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=200&h=200&fit=crop',
                positionX: 45,
                positionY: 20,
                order: 2,
                windowTitle: 'Get in Touch',
                windowSubtitle: 'Let\'s Connect',
                windowDescription: 'I\'m always open to discussing new projects, creative ideas, or opportunities to be part of your vision.\n\nFeel free to reach out through any of the channels below.',
                windowLinks: [
                  { label: 'Email Me', url: 'mailto:hello@example.com' },
                  { label: 'Twitter', url: 'https://twitter.com' },
                ],
              },
            ],
          },
          dockItems: {
            create: [
              { icon: '🏠', label: 'Home', actionType: 'url', actionValue: '/', order: 0 },
              { icon: '📧', label: 'Email', actionType: 'email', actionValue: 'hello@example.com', order: 1 },
              { icon: '💼', label: 'LinkedIn', actionType: 'url', actionValue: 'https://linkedin.com', order: 2 },
              { icon: '🐙', label: 'GitHub', actionType: 'url', actionValue: 'https://github.com', order: 3 },
              { icon: '🐦', label: 'Twitter', actionType: 'url', actionValue: 'https://twitter.com', order: 4 },
            ],
          },
        },
      },
    },
  });

  console.log('Created demo user:', demoUser.email);
  console.log('\n✅ Seed completed!');
  console.log('\nDemo account credentials:');
  console.log('  Email: demo@meos.io');
  console.log('  Password: demo123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
