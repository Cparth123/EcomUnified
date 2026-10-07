import { NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET() {
  try {
    const autoSettings = supplierStore.getAutomationSettings();

    const integrations = [
      {
        id: 'amazon',
        name: 'Amazon Selling Partner (SP-API)',
        type: 'MARKETPLACE',
        status: autoSettings.isAmazonConnected ? 'CONNECTED' : 'DISCONNECTED',
        marketplaceId: 'A21TJRUUN4KGV', // Amazon India
        marketplaceName: 'Amazon.in',
        features: ['Automated Orders Sync', 'Catalog Retrieval', 'FBA / Merchant Orders'],
        lastSyncedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'telegram',
        name: 'Telegram MTProto Wholesale Engine',
        type: 'COMMUNICATION',
        status: 'CONNECTED',
        features: ['Multi-Channel Scraping', 'Public Search', 'Post Extraction', 'Real-Time Links'],
        lastSyncedAt: new Date().toISOString(),
      },
      {
        id: 'gemini',
        name: 'Google Gemini 1.5/2.0 AI',
        type: 'AI_INTELLIGENCE',
        status: 'CONNECTED',
        features: ['Image Multimodal Analysis', 'Keyword Extraction', 'Complex Post Parsing'],
        lastSyncedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      integrations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
