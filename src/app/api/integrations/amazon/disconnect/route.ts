import { NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function POST() {
  try {
    supplierStore.updateAutomationSettings({
      isAmazonConnected: false,
      autoOrderMonitoring: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Amazon Seller Account disconnected successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
