import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API route for loading external websites in the goOS link browser.
 * Many sites block iframe embedding via X-Frame-Options or CSP headers.
 * This proxy strips those headers so sites can be displayed inside the app.
 */

// Allowed URL protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

// Max response size (10MB)
const MAX_SIZE = 10 * 1024 * 1024;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'text/html';

    // Only proxy HTML content
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      // For non-HTML, redirect directly
      return NextResponse.redirect(url);
    }

    let html = await response.text();

    if (html.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Response too large' }, { status: 413 });
    }

    // Inject a <base> tag so relative URLs resolve correctly
    const baseTag = `<base href="${parsedUrl.origin}${parsedUrl.pathname}" />`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else if (html.includes('<HEAD>')) {
      html = html.replace('<HEAD>', `<HEAD>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    // Return with permissive headers (no X-Frame-Options, no restrictive CSP)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300',
        // Explicitly do NOT set X-Frame-Options or restrictive CSP
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Proxy failed' },
      { status: 502 }
    );
  }
}
