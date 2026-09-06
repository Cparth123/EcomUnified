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

    const dbStatus = await connectToDatabase();
    let userPayload;

    if (dbStatus.isConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      userPayload = {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        storeName: user.storeName,
        role: user.role,
      };
    } else {
      // Demo / Fallback mode
      userPayload = {
        userId: 'demo-user-1',
        email: email.toLowerCase(),
        name: email.split('@')[0].toUpperCase(),
        storeName: 'OmniTrade India Solutions',
        role: 'seller',
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
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
