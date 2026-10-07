import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/NotificationService';

export async function GET() {
  try {
    const notifications = notificationService.getNotifications();
    const unreadCount = notificationService.getUnreadCount();
    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, markAll } = await req.json();

    if (markAll) {
      notificationService.markAllAsRead();
    } else if (id) {
      notificationService.markAsRead(id);
    }

    return NextResponse.json({
      success: true,
      unreadCount: notificationService.getUnreadCount(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
