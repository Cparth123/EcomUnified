import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let channels = supplierStore.getChannels();

    if (category && category !== 'all') {
      channels = channels.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      channels = channels.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      suppliers: channels,
      total: channels.length,
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

    if (!body.name || !body.username) {
      return NextResponse.json(
        { success: false, error: 'Supplier name and Telegram username are required.' },
        { status: 400 }
      );
    }

    const username = body.username.startsWith('@') ? body.username : `@${body.username}`;

    const newChannel = supplierStore.addChannel({
      name: body.name,
      username,
      channelId: body.channelId || '',
      groupId: body.groupId || '',
      channelType: body.channelType || 'PUBLIC_CHANNEL',
      category: body.category || 'General Wholesale',
      keywords: Array.isArray(body.keywords)
        ? body.keywords
        : typeof body.keywords === 'string'
        ? body.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [],
      location: body.location || 'Surat / Delhi',
      description: body.description || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      priority: Number(body.priority) || 5,
      notes: body.notes || '',
      contactNumber: body.contactNumber || '',
    });

    return NextResponse.json({
      success: true,
      supplier: newChannel,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
