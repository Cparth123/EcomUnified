import { NextRequest, NextResponse } from 'next/server';
import {
  fetchDynamicTelegramData,
  setTelegramConnectedDialogs,
  setTelegramSyncedProducts,
  setTelegramUserAccount,
} from '@/lib/telegramClient';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) || 'default_seller';
    const body = await req.json().catch(() => ({}));

    // Allow dynamically setting custom dialogs, products, or user account info
    if (body.dialogs && Array.isArray(body.dialogs)) {
      await setTelegramConnectedDialogs(userId, body.dialogs);
    }
    if (body.products && Array.isArray(body.products)) {
      await setTelegramSyncedProducts(userId, body.products);
    }
    if (body.userAccount && typeof body.userAccount === 'object') {
      await setTelegramUserAccount(userId, body.userAccount);
    }

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
