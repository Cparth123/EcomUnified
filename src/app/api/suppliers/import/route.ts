import { NextRequest, NextResponse } from 'next/server';
import { SupplierMappingService } from '@/lib/services/SupplierMappingService';
import { supplierStore } from '@/lib/supplierStore';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const rows = SupplierMappingService.parseExcelOrCsv(buffer);
      const mappingsToInsert = SupplierMappingService.convertRowsToMappings(rows);
      const importedCount = supplierStore.addBatchMappings(mappingsToInsert);

      return NextResponse.json({
        success: true,
        totalRows: rows.length,
        validRows: mappingsToInsert.length,
        invalidRows: rows.length - mappingsToInsert.length,
        importedCount,
        rows,
      });
    }

    // Direct JSON payload
    const body = await req.json();
    if (Array.isArray(body.rows)) {
      const mappingsToInsert = SupplierMappingService.convertRowsToMappings(body.rows);
      const importedCount = supplierStore.addBatchMappings(mappingsToInsert);
      return NextResponse.json({
        success: true,
        importedCount,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid import payload.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/suppliers/import] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import failed.' },
      { status: 500 }
    );
  }
}
