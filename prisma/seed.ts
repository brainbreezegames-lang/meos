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
              // 1. About Me (Home)
              {
                label: 'About Me',
                thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                positionX: 15,
                positionY: 20,
                order: 0,
                windowTitle: 'About Me',
                windowSubtitle: 'Designer & Developer',
                windowDescription: 'My interactive portfolio.',
                useTabs: true,
                tabs: {
                  create: [
                    {
                      label: 'Overview',
                      order: 0,
                      blocks: {
                        create: [
                          { type: 'text', order: 0, data: { content: "Hi, I'm a **creative developer** based in San Francisco. I build digital products that feel alive.\n\nThis desktop environment is my portfolio – it allows you to explore my work in a more interactive way than a static site." } },
                          { type: 'stats', order: 1, data: { items: [{ value: '5+', label: 'Years Exp.' }, { value: '47', label: 'Projects' }, { value: '12', label: 'Active Clients' }] } },
                          { type: 'divider', order: 2, data: {} },
                          { type: 'text', order: 3, data: { content: "I specialize in **React**, **Next.js**, and building comprehensive design systems. My goal is to bridge the gap between design and engineering." } }
                        ]
                      }
                    },
                    {
                      label: 'Experience',
                      order: 1,
                      blocks: {
                        create: [
                          {
                            type: 'timeline', order: 0, data: {
                              items: [
                                { date: '2023 - Present', title: 'Senior Frontend Engineer', subtitle: 'TechCorp Inc.', description: 'Leading the design system team and core infrastructure.' },
                                { date: '2020 - 2023', title: 'Product Designer', subtitle: 'Creative Agency', description: 'Designed and shipped award-winning marketing sites.' }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              // 2. My Projects (Product Grid)
              {
                label: 'Projects',
                thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
                positionX: 30,
                positionY: 20,
                order: 1,
                windowTitle: 'My Projects',
                windowSubtitle: 'Recent Work',
                windowDescription: 'A showcase of my recent projects.',
                blocks: {
                  create: [
                    { type: 'text', order: 0, data: { content: "Here is a collection of my recent work, ranging from full-stack applications to open-source libraries." } },
                    { type: 'product-grid', order: 1, data: {} }
                  ]
                }
              },
              // 3. Docs (Spreadsheet)
              {
                label: 'Docs',
                thumbnailUrl: 'https://images.unsplash.com/photo-1568290943833-2ba37a1a457c?w=200&h=200&fit=crop',
                positionX: 45,
                positionY: 20,
                order: 2,
                windowTitle: 'Documentation',
                windowSubtitle: 'Articles & Notes',
                windowDescription: 'Technical writing and thoughts.',
                blocks: {
                  create: [
                    { type: 'spreadsheet', order: 0, data: {} }
                  ]
                }
              },
              // 4. Pricing (Custom)
              {
                label: 'Pricing',
                thumbnailUrl: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?w=200&h=200&fit=crop',
                positionX: 60,
                positionY: 20,
                order: 3,
                windowTitle: 'Services',
                windowSubtitle: 'Rates & Packages',
                windowDescription: 'Services I offer.',
                blocks: {
                  create: [
                    { type: 'text', order: 0, data: { content: "# Project Rates\nI offer flexible engagement models suitable for startups and enterprise teams." } },
                    {
                      type: 'details', order: 1, data: {
                        items: [
                          { label: 'Hourly Rate', value: '$150/hr' },
                          { label: 'Weekly Retainer', value: '$5,000' },
                          { label: 'Minimum Project', value: '$10,000' }
                        ]
                      }
                    },
                    { type: 'callout', order: 2, data: { text: "Currently available for Q3 2026 bookings.", style: 'info' } },
                    { type: 'buttons', order: 3, data: { buttons: [{ label: 'Book a Call', url: 'mailto:demo@meos.io', style: 'primary' }] } }
                  ]
                }
              },
              // 5. Contact
              {
                label: 'Contact',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=200&h=200&fit=crop',
                positionX: 75,
                positionY: 20,
                order: 4,
                windowTitle: 'Get in Touch',
                windowSubtitle: 'Let\'s Connect',
                windowDescription: 'Contact information.',
                blocks: {
                  create: [
                    { type: 'text', order: 0, data: { content: "I'm always open to discussing new projects, creative ideas, or opportunities.\n\nFeel free to reach out through any of the channels below." } },
                    {
                      type: 'social', order: 1, data: {
                        profiles: [
                          { platform: 'email', url: 'mailto:demo@meos.io' },
                          { platform: 'twitter', url: 'https://twitter.com' },
                          { platform: 'linkedin', url: 'https://linkedin.com' },
                          { platform: 'github', url: 'https://github.com' }
                        ]
                      }
                    }
                  ]
                }
              },
            ],
          },
          dockItems: {
            create: [
              { icon: '🏠', label: 'Home', actionType: 'window', actionValue: '0', order: 0 },
              { icon: '▦', label: 'Projects', actionType: 'window', actionValue: '1', order: 1 },
              { icon: '📝', label: 'Docs', actionType: 'window', actionValue: '2', order: 2 },
              { icon: '💲', label: 'Pricing', actionType: 'window', actionValue: '3', order: 3 },
              { icon: '📧', label: 'Contact', actionType: 'email', actionValue: 'hello@example.com', order: 4 },
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
