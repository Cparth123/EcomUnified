import { NextResponse } from 'next/server';
import globalStore from '@/lib/store';

export async function POST() {
  globalStore.resetToDefault();
  return NextResponse.json({
    success: true,
    message: 'Store re-seeded successfully with 30-day multi-channel order data and AI reports',
    metrics: globalStore.getDashboardMetrics('all', 30),
  });
}
