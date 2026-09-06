import { NextRequest, NextResponse } from 'next/server';
import globalStore from '@/lib/store';
import { PlatformType } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = (searchParams.get('platform') || 'all') as PlatformType;
  const days = parseInt(searchParams.get('days') || '30', 10);

  const metrics = globalStore.getDashboardMetrics(platform, days);
  return NextResponse.json({ success: true, data: metrics });
}
