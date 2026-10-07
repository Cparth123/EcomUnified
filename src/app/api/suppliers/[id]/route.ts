import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (body.username && !body.username.startsWith('@')) {
      body.username = `@${body.username}`;
    }

    if (typeof body.keywords === 'string') {
      body.keywords = body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }

    const updated = supplierStore.updateChannel(params.id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Supplier channel not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = supplierStore.deleteChannel(params.id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
