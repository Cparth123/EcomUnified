import * as XLSX from 'xlsx';
import { SupplierProductMapping, SupplierChannel } from '@/types/supplierSearch';

export interface ImportValidationRow {
  rowNumber: number;
  productName: string;
  keywords: string;
  telegramChannel: string;
  category?: string;
  priority?: number;
  isValid: boolean;
  errors: string[];
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedCount: number;
  rows: ImportValidationRow[];
}

export class SupplierMappingService {
  /**
   * Parses and validates raw Excel/CSV binary buffer for supplier product mappings.
   */
  public static parseExcelOrCsv(buffer: Buffer | ArrayBuffer): ImportValidationRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    const validatedRows: ImportValidationRow[] = [];

    rawJson.forEach((row, index) => {
      const rowNumber = index + 2; // Accounting for 1-based header
      const errors: string[] = [];

      // Flexible column headers
      const productName = String(
        row['product_name'] ||
        row['Product Name'] ||
        row['product'] ||
        row['Product'] ||
        row['Item'] ||
        ''
      ).trim();

      const rawKeywords = String(
        row['keywords'] ||
        row['Keywords'] ||
        row['tags'] ||
        row['Tags'] ||
        ''
      ).trim();

      const telegramChannel = String(
        row['telegram_channel'] ||
        row['telegram_username'] ||
        row['Telegram Channel'] ||
        row['Telegram Username'] ||
        row['channel'] ||
        row['Channel'] ||
        ''
      ).trim();

      const category = String(
        row['category'] ||
        row['Category'] ||
        'General'
      ).trim();

      const rawPriority = row['priority'] || row['Priority'] || 5;
      const priority = Math.min(10, Math.max(1, parseInt(String(rawPriority), 10) || 5));

      if (!productName) {
        errors.push('Product name is required');
      }

      if (!telegramChannel) {
        errors.push('Telegram channel or username is required');
      }

      const formattedChannel = telegramChannel.startsWith('@')
        ? telegramChannel
        : telegramChannel.startsWith('http')
        ? telegramChannel
        : `@${telegramChannel}`;

      validatedRows.push({
        rowNumber,
        productName,
        keywords: rawKeywords,
        telegramChannel: formattedChannel,
        category,
        priority,
        isValid: errors.length === 0,
        errors,
      });
    });

    return validatedRows;
  }

  /**
   * Converts validated rows into SupplierProductMapping entries.
   */
  public static convertRowsToMappings(rows: ImportValidationRow[]): SupplierProductMapping[] {
    return rows
      .filter(r => r.isValid)
      .map(r => ({
        id: `map_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        productName: r.productName,
        category: r.category,
        supplierChannelId: r.telegramChannel,
        supplierChannelUsername: r.telegramChannel,
        keywords: r.keywords ? r.keywords.split(/[,;|]/).map(k => k.trim()).filter(Boolean) : [r.productName],
        priority: r.priority || 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
  }
}
