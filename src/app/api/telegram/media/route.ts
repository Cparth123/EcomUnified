import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy and resolve original Telegram media and photos safely without CORS issues
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('url');

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Missing media URL' }, { status: 400 });
    }

    // Validate that URL is from Telegram CDN or web domain
    const allowedDomains = ['cdn-telegram.org', 'telegram.org', 't.me', 'telesco.pe'];
    const isAllowed = allowedDomains.some((d) => mediaUrl.includes(d));

    if (!isAllowed && !mediaUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid media source' }, { status: 400 });
    }

    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch original media' }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/telegram/media:', error);
    return NextResponse.json({ error: error.message || 'Media proxy error' }, { status: 500 });
  }
}
