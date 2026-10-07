import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateResetToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Please provide your account email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const dbStatus = await connectToDatabase();

    const { token, expires } = generateResetToken();

    if (dbStatus.isConnected) {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return NextResponse.json(
          { error: 'No seller account registered with this email address' },
          { status: 404 }
        );
      }

      user.resetToken = token;
      user.resetTokenExpiry = expires;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset token generated successfully.',
      resetToken: token,
      resetLink: `/reset-password?token=${token}`,
      expiresIn: '1 hour',
    });
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process forgot password request' },
      { status: 500 }
    );
  }
}
