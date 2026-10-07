import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, storeName, gstin, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);
    const dbStatus = await connectToDatabase();

    let userId: string;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`;

    if (dbStatus.isConnected) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        storeName: storeName?.trim() || `${name.trim()}'s Store`,
        gstin: gstin?.trim().toUpperCase() || '',
        phone: phone?.trim() || '',
        avatar,
        role: 'seller',
      });

      userId = newUser._id.toString();
    } else {
      userId = `usr-${Date.now()}`;
    }

    const payload = {
      userId,
      email: normalizedEmail,
      name: name.trim(),
      storeName: storeName?.trim() || `${name.trim()}'s Store`,
      role: 'seller',
      avatar,
    };

    const token = signToken(payload);

    const response = NextResponse.json({
      success: true,
      message: 'Seller account created successfully',
      token,
      user: payload,
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
