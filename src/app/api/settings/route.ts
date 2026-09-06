import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: globalStore.getSettings(),
    credentials: globalStore.getCredentials(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.settings) globalStore.updateSettings(body.settings);
    if (body.credentials) globalStore.updateCredentials(body.credentials);

    return NextResponse.json({
      success: true,
      settings: globalStore.getSettings(),
      credentials: globalStore.getCredentials(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
