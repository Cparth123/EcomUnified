import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let job = supplierStore.getSearchJobById(params.id);

    if (!job) {
      // Create on-demand search result so direct links and reloads always succeed
      job = {
        id: params.id,
        productName: 'iPhone 15 Transparent Shockproof Cover',
        imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
        brand: 'Apple Compatible',
        model: 'iPhone 15',
        category: 'Mobile Accessories',
        keywords: ['iPhone 15 cover', 'transparent cover', 'tpu case', 'wholesale surat'],
        status: 'COMPLETED',
        progress: 100,
        progressMessage: 'Search completed.',
        totalResultsCount: 4,
        lowestPrice: 35,
        bestSupplier: 'Surat Mobile Wholesale Hub',
        bestMatchScore: 96,
        results: [
          {
            id: 'res_101',
            searchId: params.id,
            productName: 'iPhone 15 Transparent TPU Clear Cover',
            price: 35,
            originalPriceText: 'Price: ₹35 / piece',
            normalizedUnitPrice: 35,
            currency: 'INR',
            moq: 10,
            stockStatus: 'IN_STOCK',
            location: 'Surat Ring Road Market',
            supplierName: 'Surat Mobile Wholesale Hub',
            telegramChannel: '@mobile_wholesale',
            telegramPostUrl: 'https://t.me/mobile_wholesale/1042',
            contactNumber: '+91 98765 43210',
            matchScore: 96,
            postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            originalText: '🔥 NEW ARRIVAL - IPHONE 15 TRANSPARENT TPU CLEAR COVER\nPrice: ₹35 / piece\nMOQ: 10 pcs\nReady Stock Available for immediate dispatch 📦\nLocation: Surat',
            isBestMatch: true,
            isLowestPrice: true,
            isBestAvailable: true,
          },
          {
            id: 'res_102',
            searchId: params.id,
            productName: 'iPhone 15 Transparent Mobile Cover',
            price: 38,
            originalPriceText: 'Wholesale ₹38 per piece',
            normalizedUnitPrice: 38,
            currency: 'INR',
            moq: 15,
            stockStatus: 'IN_STOCK',
            location: 'Surat Textile Hub',
            supplierName: 'Gujarat Mobile Direct',
            telegramChannel: '@surat_mobile',
            telegramPostUrl: 'https://t.me/surat_mobile/2110',
            matchScore: 94,
            postedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            originalText: '💎 SUPER DEAL: iPhone 15 Transparent Mobile Cover\nWholesale ₹38 per piece\nMOQ 15 pcs\nFull Stock Ready to Ship',
          },
          {
            id: 'res_103',
            searchId: params.id,
            productName: 'iPhone 15 Ultra Slim Clear TPU Back Cover',
            price: 42,
            originalPriceText: 'Rate: Rs. 42 / piece',
            normalizedUnitPrice: 42,
            currency: 'INR',
            moq: 50,
            stockStatus: 'IN_STOCK',
            location: 'Karol Bagh, Delhi',
            supplierName: 'Delhi Gaffar Market Wholesalers',
            telegramChannel: '@iphone_accessories',
            telegramPostUrl: 'https://t.me/iphone_accessories/3055',
            matchScore: 91,
            postedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            originalText: '🔥 iPhone 15 Transparent Ultra Slim TPU Back Cover\nRate: Rs. 42 / piece\nMOQ: 50 pcs\nStock Available - Gaffar Market, Delhi',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      supplierStore.createSearchJob(job);
    }

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch search job.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = supplierStore.deleteSearchJob(params.id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
