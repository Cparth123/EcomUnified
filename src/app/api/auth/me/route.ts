import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase, IS_LIVE_DATA } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const authPayload = getAuthUser(req);
  const dbStatus = await connectToDatabase();

  if (!authPayload) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      isLiveData: IS_LIVE_DATA,
      isDatabaseConnected: dbStatus.isConnected,
    });
  }

  let fullUser = authPayload;

  if (dbStatus.isConnected) {
    try {
      const userDoc = await User.findById(authPayload.userId).select('-passwordHash -resetToken');
      if (userDoc) {
        fullUser = {
          userId: userDoc._id.toString(),
          email: userDoc.email,
          name: userDoc.name,
          storeName: userDoc.storeName || `${userDoc.name}'s Store`,
          role: userDoc.role || 'seller',
          avatar: userDoc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userDoc.email)}`,
          googleId: userDoc.googleId,
        };
      }
    } catch (e) {
      console.warn('Could not fetch user by ID:', e);
    }
  }

  return NextResponse.json({
    authenticated: true,
    user: fullUser,
    isLiveData: IS_LIVE_DATA,
    isDatabaseConnected: dbStatus.isConnected,
  });
}
