import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      image: true,
      desktop: {
        select: {
          items: {
            where: {
              itemVariant: 'goos-file',
              publishStatus: 'published',
            },
            take: 6,
            select: {
              label: true,
              goosFileType: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  const displayName = user.name || user.username;
  const fileCount = user.desktop?.items.length || 0;
  const files = user.desktop?.items || [];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FAF8F0',
          backgroundImage: 'radial-gradient(#d4d4d4 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          padding: '48px',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#F0EDE0',
            borderRadius: '8px',
            border: '2px solid #2a2a2a',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E85D04',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>
              {displayName}&apos;s goOS
            </span>
          </div>
          <span style={{ fontSize: '16px', color: '#666666' }}>
            {fileCount} {fileCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* File icons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            flex: 1,
          }}
        >
          {files.slice(0, 6).map((file, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#FFFDF5',
                  border: '2px solid #2a2a2a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '4px 4px 0 rgba(0,0,0,0.08)',
                }}
              >
                {file.goosFileType === 'folder' ? '📁' : file.goosFileType === 'case-study' ? '📊' : '📝'}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: '#3a3a3a',
                  maxWidth: '80px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.label.slice(0, 12)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#F0EDE0',
              borderRadius: '20px',
              border: '1.5px solid #2a2a2a',
            }}
          >
            <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>
              goos.io/{username}
            </span>
          </div>
          <span style={{ fontSize: '14px', color: '#666666' }}>
            The Creator&apos;s Space
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
