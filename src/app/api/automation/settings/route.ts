import { NextRequest, NextResponse } from 'next/server';
import { supplierStore } from '@/lib/supplierStore';

export async function GET() {
  try {
    const settings = supplierStore.getAutomationSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = supplierStore.updateAutomationSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
