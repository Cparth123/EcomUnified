import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, getGoogleConfig } from '@/lib/googleAuth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get('state') || 'seller_login';
    
    const config = getGoogleConfig();
    const url = getGoogleAuthUrl(state);

    return NextResponse.json({
      success: true,
      url,
      isConfigured: config.isConfigured,
      clientId: config.clientId ? `${config.clientId.substring(0, 16)}...` : '',
      redirectUri: config.redirectUri,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate Google Auth URL' },
      { status: 500 }
    );
  }
}
