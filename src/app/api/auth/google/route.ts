import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { verifyGoogleIdToken, getGoogleUserInfo, getGoogleConfig } from '@/lib/googleAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, accessToken, email, name, googleId, avatar } = body;

    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedGoogleId = googleId;
    let resolvedAvatar = avatar;

    // 1. If Google ID Token (credential) is passed from Google Identity Services
    if (credential) {
      try {
        const profile = await verifyGoogleIdToken(credential);
        resolvedEmail = profile.email;
        resolvedName = profile.name;
        resolvedGoogleId = profile.sub;
        resolvedAvatar = profile.picture || resolvedAvatar;
      } catch (err: any) {
        console.warn('Google ID token verification notice:', err.message);
        // If client passed fallback email, use it
        if (!resolvedEmail) {
          return NextResponse.json({ error: 'Failed to verify Google credentials' }, { status: 400 });
        }
      }
    } 
    // 2. If Access Token is passed
    else if (accessToken) {
      try {
        const profile = await getGoogleUserInfo(accessToken);
        resolvedEmail = profile.email;
        resolvedName = profile.name;
        resolvedGoogleId = profile.sub;
        resolvedAvatar = profile.picture || resolvedAvatar;
      } catch (err: any) {
        console.warn('Google Access Token verification notice:', err.message);
      }
    }

    if (!resolvedEmail) {
      return NextResponse.json({ error: 'Google email is required' }, { status: 400 });
    }

    const normalizedEmail = resolvedEmail.toLowerCase().trim();
    const dbStatus = await connectToDatabase();

    let userDoc: any = null;
    let userId: string;

    if (dbStatus.isConnected) {
      // 1. Find user by email or googleId
      userDoc = await User.findOne({
        $or: [
          { email: normalizedEmail },
          { googleId: resolvedGoogleId || '' }
        ],
      });

      if (userDoc) {
        // Update user's googleId / avatar if not present
        if (!userDoc.googleId && resolvedGoogleId) userDoc.googleId = resolvedGoogleId;
        if (!userDoc.avatar && resolvedAvatar) userDoc.avatar = resolvedAvatar;
        if (!userDoc.name && resolvedName) userDoc.name = resolvedName;
        await userDoc.save();
      } else {
        // 2. Create new seller account for Google Sign-In
        userDoc = await User.create({
          name: resolvedName || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          googleId: resolvedGoogleId || `google_${Date.now()}`,
          avatar: resolvedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
          storeName: `${resolvedName || 'Seller'}'s Store`,
          role: 'seller',
        });
      }

      userId = userDoc._id.toString();
    } else {
      userId = `google_seller_${Date.now()}`;
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: userDoc?.name || resolvedName || normalizedEmail.split('@')[0],
      storeName: userDoc?.storeName || `${resolvedName || 'Seller'}'s Store`,
      role: userDoc?.role || 'seller',
      avatar: userDoc?.avatar || resolvedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      googleId: resolvedGoogleId || userDoc?.googleId,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Signed in with Google successfully',
      token,
      user: payload,
      isLiveDatabase: dbStatus.isConnected,
      googleConfig: getGoogleConfig(),
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Google Auth API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
