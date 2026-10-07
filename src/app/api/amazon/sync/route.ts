import { NextResponse } from 'next/server';
import { orderSyncService } from '@/lib/services/OrderSyncService';

export async function POST() {
  try {
    const result = await orderSyncService.syncAmazonOrders();

    return NextResponse.json({
      success: true,
      syncedCount: result.syncedCount,
      matchedCount: result.matchedCount,
      orders: result.orders,
      message: `Successfully synchronized ${result.syncedCount} Amazon orders. Found wholesale supplier matches for ${result.matchedCount} orders.`,
    });
  } catch (error: any) {
    console.error('[API /api/amazon/sync] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync Amazon orders.' },
      { status: 500 }
    );
  }
}
