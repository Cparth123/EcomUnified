import { NextRequest, NextResponse } from 'next/server';
import { fetchDynamicTelegramData } from '@/lib/telegramClient';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) || 'default_seller';
    const { dialogs, products, userAccount } = await fetchDynamicTelegramData(userId);

    return NextResponse.json({
      success: true,
      message: `Dynamically fetched ${products.length} live products across ${dialogs.length} connected Telegram groups!`,
      dialogs,
      products,
      userAccount,
      count: products.length,
      lastSyncAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/telegram/sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dynamically sync Telegram groups' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
