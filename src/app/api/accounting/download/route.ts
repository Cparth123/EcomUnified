import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getAccountingData, generateExcelBuffer } from '@/lib/accountingService';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const { data } = await getAccountingData(userId || undefined);

    // Generate Excel buffer in memory
    const fileBuffer = generateExcelBuffer(data);

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
    
    // Fallback to reading file from disk if present
    try {
      const filePath = path.join(process.cwd(), 'Account Calc.xlsx');
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Account_Calc.xlsx"',
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      }
    } catch (fallbackErr) {
      console.error('Fallback disk read error:', fallbackErr);
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to download file' },
      { status: 500 }
    );
  }
}

