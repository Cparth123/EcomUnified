import { NextRequest, NextResponse } from 'next/server';
import { searchTelegramProducts, getTelegramConfig } from '@/lib/telegramClient';
import { TelegramSearchFilters } from '@/types/telegram';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Returns Telegram search configuration, supported channels, and default products
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) || 'default_seller';
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const channel = searchParams.get('channel') || 'all';
    const category = searchParams.get('category') || 'all';
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';

    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

    const filters: TelegramSearchFilters = {
      query,
      channel,
      category,
      minPrice,
      maxPrice,
      sortBy,
    };

    const config = getTelegramConfig();
    const result = await searchTelegramProducts(filters, userId);

    return NextResponse.json({
      success: true,
      count: result.count,
      channel: result.channel,
      query: filters.query,
      products: result.products,
      userAccount: result.userAccount,
      dialogs: result.dialogs,
      cached: result.cached,
      telegramConfig: {
        isConfigured: config.isConfigured,
        apiIdConfigured: Boolean(config.apiId),
        defaultChannel: config.defaultChannel,
      },
      availableChannels: result.dialogs || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/telegram-search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search Telegram products' },
      { status: 500 }
    );
  }
}

// POST: Handles keyword and AI Image upload search across Telegram channels
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) || 'default_seller';
    const body = await req.json().catch(() => ({}));
    const { query, image, channel, category, minPrice, maxPrice, sortBy } = body;

    const filters: TelegramSearchFilters = {
      query: typeof query === 'string' ? query : '',
      image: typeof image === 'string' ? image : undefined,
      channel: typeof channel === 'string' ? channel : 'all',
      category: typeof category === 'string' ? category : 'all',
      minPrice: typeof minPrice === 'number' ? minPrice : undefined,
      maxPrice: typeof maxPrice === 'number' ? maxPrice : undefined,
      sortBy: sortBy || 'relevance',
    };

    const config = getTelegramConfig();
    const result = await searchTelegramProducts(filters, userId);

    return NextResponse.json({
      success: true,
      count: result.count,
      channel: result.channel,
      query: filters.query,
      aiAnalysis: result.aiAnalysis,
      products: result.products,
      userAccount: result.userAccount,
      dialogs: result.dialogs,
      cached: result.cached,
      telegramConfig: {
        isConfigured: config.isConfigured,
        apiIdConfigured: Boolean(config.apiId),
        defaultChannel: config.defaultChannel,
      },
      availableChannels: result.dialogs || [],
    });
  } catch (error: any) {
    console.error('Error in POST /api/telegram-search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute Telegram product search' },
      { status: 500 }
    );
  }
}
