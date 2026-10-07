import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET() {
  try {
    const mappings = supplierStore.getMappings();
    return NextResponse.json({
      success: true,
      mappings,
      total: mappings.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.productName || !body.supplierChannelUsername) {
      return NextResponse.json(
        { success: false, error: 'Product name and Telegram channel username are required.' },
        { status: 400 }
      );
    }

    const username = body.supplierChannelUsername.startsWith('@')
      ? body.supplierChannelUsername
      : `@${body.supplierChannelUsername}`;

    const newMapping = supplierStore.addMapping({
      productName: body.productName,
      category: body.category || 'General',
      productId: body.productId,
      sku: body.sku,
      asin: body.asin,
      supplierChannelId: body.supplierChannelId || username,
      supplierChannelUsername: username,
      keywords: Array.isArray(body.keywords)
        ? body.keywords
        : typeof body.keywords === 'string'
        ? body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [body.productName],
      priority: Number(body.priority) || 5,
    });

    return NextResponse.json({
      success: true,
      mapping: newMapping,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Mapping ID is required.' },
        { status: 400 }
      );
    }

    const deleted = supplierStore.deleteMapping(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
