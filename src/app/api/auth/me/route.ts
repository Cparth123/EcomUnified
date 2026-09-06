import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase, IS_LIVE_DATA } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  const dbStatus = await connectToDatabase();

  if (!user) {
    // Return guest seller status
    return NextResponse.json({
      authenticated: false,
      user: null,
      isLiveData: IS_LIVE_DATA,
      isDatabaseConnected: dbStatus.isConnected,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user,
    isLiveData: IS_LIVE_DATA,
    isDatabaseConnected: dbStatus.isConnected,
  });
}
