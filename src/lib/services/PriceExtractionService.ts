import { ExtractedPriceInfo } from '@/types/supplierSearch';

export class PriceExtractionService {
  /**
   * Deterministically parses price, normalized unit price, currency, and MOQ from post text.
   */
  public static extractPrice(text: string): ExtractedPriceInfo {
    if (!text || typeof text !== 'string') {
      return {
        originalPriceText: 'Price on request',
        normalizedUnitPrice: 0,
        currency: 'INR',
        moq: 1,
      };
    }

    const cleanText = text.replace(/\r\n/g, '\n');
    let moq = this.extractMOQ(cleanText);

    // Pattern 1: Bulk pack pricing, e.g. "₹350 for 10 pcs", "Rs. 350 / 10 pcs", "350 per 10 pcs", "350/10pcs", "10 pcs @ ₹350"
    const bulkPackPatterns = [
      /(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:\/|for|per|@)\s*(\d+)\s*(?:pcs|pieces|pc|units|nos|qty)/i,
      /(\d+)\s*(?:pcs|pieces|pc|units|nos|qty)\s*(?:for|@|\/)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
      /box\s+of\s+(\d+)\s*(?:pcs)?\s*(?:for|@|:)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    ];

    for (const pattern of bulkPackPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        let totalPrice = 0;
        let packQty = 1;

        if (pattern === bulkPackPatterns[1]) {
          packQty = parseInt(match[1], 10);
          totalPrice = parseFloat(match[2].replace(/,/g, ''));
        } else if (pattern === bulkPackPatterns[2]) {
          packQty = parseInt(match[1], 10);
          totalPrice = parseFloat(match[2].replace(/,/g, ''));
        } else {
          totalPrice = parseFloat(match[1].replace(/,/g, ''));
          packQty = parseInt(match[2], 10);
        }

        if (packQty > 0 && totalPrice > 0) {
          const unitPrice = Math.round((totalPrice / packQty) * 100) / 100;
          return {
            originalPriceText: match[0].trim(),
            normalizedUnitPrice: unitPrice,
            currency: 'INR',
            moq: moq || packQty,
            rawAmount: totalPrice,
            rawPackSize: packQty,
          };
        }
      }
    }

    // Pattern 2: Unit price patterns, e.g. "₹35 / piece", "Rs. 35/pc", "Price: ₹35", "Wholesale ₹35", "35/-", "Rate: 35"
    const unitPricePatterns = [
      /(?:rate|price|wholesale|cost|offer|rs\.?|₹|inr)\s*[:=-]?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:\/\-|\/-|\/(?:pc|piece|unit|item|nos)|per\s+(?:pc|piece|unit))?/i,
      /(?:₹|rs\.?)\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:\/\-|\/-)?/i,
      /(\d+(?:,\d+)?)\s*(?:\/\-|\/-)/,
      /(?:only|just)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i,
    ];

    for (const pattern of unitPricePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        const rawPrice = parseFloat(match[1].replace(/,/g, ''));
        // Basic sanity check: avoid phone numbers, pin codes or huge numbers as single unit wholesale prices
        if (rawPrice > 0 && rawPrice < 500000) {
          return {
            originalPriceText: match[0].trim(),
            normalizedUnitPrice: rawPrice,
            currency: 'INR',
            moq: moq || 1,
            rawAmount: rawPrice,
            rawPackSize: 1,
          };
        }
      }
    }

    return {
      originalPriceText: 'Price on request',
      normalizedUnitPrice: 0,
      currency: 'INR',
      moq: moq || 1,
    };
  }

  /**
   * Extracts Minimum Order Quantity (MOQ)
   */
  public static extractMOQ(text: string): number {
    const moqPatterns = [
      /(?:moq|min(?:imum)?\s*order(?:\s*qty)?|min\s*qty|minimum\s*quantity)\s*[:=-]?\s*(\d+)\s*(?:pcs|pieces|pc|units|nos)?/i,
      /(\d+)\s*(?:pcs|pieces|pc|units|nos)\s*(?:minimum|min\s*order|moq)/i,
    ];

    for (const pattern of moqPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const qty = parseInt(match[1], 10);
        if (qty > 0 && qty < 100000) {
          return qty;
        }
      }
    }

    return 1;
  }
}
