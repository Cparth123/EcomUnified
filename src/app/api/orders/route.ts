import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';
import { PlatformType, OrderStatus, OrderItem } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform') as PlatformType | undefined;
  const status = searchParams.get('status') as OrderStatus | undefined;
  const searchTerm = searchParams.get('searchTerm') || undefined;
  const category = searchParams.get('category') || undefined;

  const orders = globalStore.getOrders({
    platform,
    status,
    searchTerm,
    category,
  });

  return NextResponse.json({ success: true, count: orders.length, data: orders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newOrder: OrderItem = {
      ...body,
      id: body.id || `ord-${Date.now()}`,
      orderDate: body.orderDate || new Date().toISOString(),
    };
    globalStore.addOrder(newOrder);
    return NextResponse.json({ success: true, data: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
