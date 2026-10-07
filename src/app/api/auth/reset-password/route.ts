import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const dbStatus = await connectToDatabase();

    if (dbStatus.isConnected) {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired password reset token' },
          { status: 400 }
        );
      }

      user.passwordHash = await hashPassword(newPassword);
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now login with your new password.',
    });
  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
