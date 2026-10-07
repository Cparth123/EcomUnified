import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramLoginCode, verifyTelegramLoginCode, saveTelegramSession } from '@/lib/telegramClient';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) || 'default_seller';
    const body = await req.json();
    const { action, phone, code, password, sessionString } = body;

    // Action 1: Send Telegram OTP code to phone number
    if (action === 'send-code') {
      if (!phone || phone.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: 'Please provide a valid phone number with country code (e.g. +91 98250 14420)' },
          { status: 400 }
        );
      }

      const result = await sendTelegramLoginCode(phone.trim());
      return NextResponse.json(result);
    }

    // Action 2: Verify OTP code and sign in
    if (action === 'verify-code') {
      if (!phone || !code) {
        return NextResponse.json(
          { success: false, error: 'Phone number and Telegram OTP code are required' },
          { status: 400 }
        );
      }

      const result = await verifyTelegramLoginCode(phone.trim(), code.trim(), password, userId);
      return NextResponse.json(result);
    }

    // Action 3: Save direct session string
    if (action === 'save-session' && sessionString) {
      await saveTelegramSession(userId, sessionString.trim(), phone);
      return NextResponse.json({
        success: true,
        message: 'Telegram session string saved and activated successfully!',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified. Supported actions: send-code, verify-code, save-session' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in /api/telegram/auth:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Telegram authentication error' },
      { status: 500 }
    );
  }
}
