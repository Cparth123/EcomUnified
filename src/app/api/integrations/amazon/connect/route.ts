import { NextRequest, NextResponse } from 'next/server';
import { AmazonSellerProvider } from '@/lib/providers/marketplace/AmazonSellerProvider';
import { supplierStore } from '@/lib/supplierStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, clientSecret, refreshToken, sellerId, marketplaceId } = body;

    const provider = new AmazonSellerProvider({
      clientId,
      clientSecret,
      refreshToken,
      sellerId,
      marketplaceId: marketplaceId || 'A21TJRUUN4KGV',
    });

    const test = await provider.testConnection();

    supplierStore.updateAutomationSettings({
      isAmazonConnected: true,
    });

    return NextResponse.json({
      success: true,
      message: test.message,
      accountName: test.accountName,
      connectedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to connect Amazon Seller Account' },
      { status: 500 }
    );
  }
}
