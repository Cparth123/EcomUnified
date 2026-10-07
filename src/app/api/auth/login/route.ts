import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = await connectToDatabase();
    let userPayload;

    if (dbStatus.isConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: 'This account was registered with Google. Please use Google Login.' },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      userPayload = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        storeName: user.storeName || `${user.name}'s Store`,
        role: user.role || 'seller',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
      };
    } else {
      // Demo fallback
      userPayload = {
        userId: 'demo-seller-101',
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0].toUpperCase(),
        storeName: 'OmniTrade India Solutions',
        role: 'seller',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      };
    }

    const token = signToken(userPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userPayload,
      isLiveDatabase: dbStatus.isConnected,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during login' },
      { status: 500 }
    );
  }
}
