import { AppNotification } from '@/types/supplierSearch';

class NotificationServiceManager {
  private notifications: AppNotification[] = [
    {
      id: 'notif_init_1',
      title: 'Cheapest Supplier Opportunity Found',
      message: 'Surat Mobile Wholesale has iPhone 15 Transparent Cover available for ₹35/unit (MOQ: 10). Save up to 88% vs selling price!',
      type: 'order_match',
      isRead: false,
      supplierName: 'Surat Mobile Wholesale',
      price: 35,
      telegramPostUrl: 'https://t.me/mobile_wholesale/1042',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_init_2',
      title: 'Amazon Auto Order Synced',
      message: 'Order #408-7291034-8291041 matched with Gujarat Mobile Accessories @ ₹38/unit (IN STOCK).',
      type: 'order_match',
      isRead: false,
      orderId: '408-7291034-8291041',
      supplierName: 'Gujarat Mobile Accessories',
      price: 38,
      telegramPostUrl: 'https://t.me/surat_mobile/2110',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ];

  public getNotifications(): AppNotification[] {
    return [...this.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): AppNotification {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notification,
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  public markAsRead(id: string): boolean {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      return true;
    }
    return false;
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => {
      n.isRead = true;
    });
  }

  public deleteNotification(id: string): boolean {
    const initialLen = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    return this.notifications.length < initialLen;
  }
}

export const notificationService = new NotificationServiceManager();
