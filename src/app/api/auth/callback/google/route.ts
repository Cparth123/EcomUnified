import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCode, getGoogleUserInfo, verifyGoogleIdToken } from '@/lib/googleAuth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
      console.warn('Google OAuth returned error:', error);
      return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${appUrl}/login?error=missing_oauth_code`);
    }

    // Exchange authorization code for tokens
    const tokenData = await exchangeGoogleCode(code);
    if (!tokenData || !tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=failed_token_exchange`);
    }

    // Fetch user profile from Google
    let profile;
    if (tokenData.id_token) {
      try {
        profile = await verifyGoogleIdToken(tokenData.id_token);
      } catch (e) {
        profile = await getGoogleUserInfo(tokenData.access_token);
      }
    } else {
      profile = await getGoogleUserInfo(tokenData.access_token);
    }

    if (!profile || !profile.email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email_from_google`);
    }

    const normalizedEmail = profile.email.toLowerCase().trim();
    const dbStatus = await connectToDatabase();

    let userDoc: any = null;
    let userId: string;

    if (dbStatus.isConnected) {
      userDoc = await User.findOne({
        $or: [{ email: normalizedEmail }, { googleId: profile.sub }],
      });

      if (userDoc) {
        if (!userDoc.googleId) userDoc.googleId = profile.sub;
        if (profile.picture) userDoc.avatar = profile.picture;
        await userDoc.save();
      } else {
        userDoc = await User.create({
          name: profile.name || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          googleId: profile.sub,
          avatar: profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
          storeName: `${profile.name || 'Seller'}'s Store`,
          role: 'seller',
        });
      }

      userId = userDoc._id.toString();
    } else {
      userId = `google_${profile.sub || Date.now()}`;
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: userDoc?.name || profile.name || normalizedEmail.split('@')[0],
      storeName: userDoc?.storeName || `${profile.name || 'Seller'}'s Store`,
      role: userDoc?.role || 'seller',
      avatar: userDoc?.avatar || profile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      googleId: profile.sub,
    };

    const token = signToken(payload);

    // Redirect to home dashboard with auth cookie set
    const response = NextResponse.redirect(`${appUrl}/?auth_success=google`);

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('Error in Google OAuth callback:', err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(err.message || 'oauth_failed')}`);
  }
}
