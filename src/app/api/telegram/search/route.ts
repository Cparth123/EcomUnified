import { NextRequest, NextResponse } from 'next/server';
import { GramJSTelegramProvider } from '@/lib/providers/telegram/GramJSTelegramProvider';
import { MockTelegramProvider } from '@/lib/providers/telegram/MockTelegramProvider';

export async function POST(req: NextRequest) {
  try {
    const { query, channel, limit } = await req.json();

    const useMock = process.env.USE_MOCK_TELEGRAM === 'true' || !process.env.TELEGRAM_API_ID;
    const provider = useMock ? new MockTelegramProvider() : new GramJSTelegramProvider();

    let posts;
    if (channel) {
      posts = await provider.searchChannelPosts(channel, query || '', limit || 20);
    } else {
      posts = await provider.searchPublicPosts(query || '', limit || 30);
    }

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Telegram search failed.' },
      { status: 500 }
    );
  }
}
