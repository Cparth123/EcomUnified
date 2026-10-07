import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { loadAccountingFromExcel, saveAccountingData } from '@/lib/accountingService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'Account Calc.xlsx');

    // Ensure current memory state is flushed to disk
    const currentData = loadAccountingFromExcel();
    saveAccountingData(currentData);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Account Calc.xlsx file not found on server' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Account_Calc.xlsx"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}
