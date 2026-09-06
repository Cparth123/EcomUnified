import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, IS_LIVE_DATA } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, storeName, gstin } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    let userId = `usr-${Date.now()}`;

    // If MongoDB is connected and LIVE_DATA is active, persist in database
    const dbStatus = await connectToDatabase();
    if (dbStatus.isConnected) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        storeName: storeName || `${name}'s Store`,
        gstin: gstin || '',
        role: 'seller',
      });

      userId = newUser._id.toString();
    }

    const payload = {
      userId,
      email: email.toLowerCase(),
      name,
      storeName: storeName || `${name}'s Store`,
      role: 'seller',
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: payload,
      isLiveDatabase: dbStatus.isConnected,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
