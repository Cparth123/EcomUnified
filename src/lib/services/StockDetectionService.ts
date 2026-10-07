import { StockStatus } from '@/types/supplierSearch';

export class StockDetectionService {
  private static inStockKeywords = [
    'available',
    'in stock',
    'ready stock',
    'stock available',
    'ready dispatch',
    'ready for dispatch',
    'full stock',
    'stock ready',
    'instant dispatch',
    'same day dispatch',
    'booking open',
    'ready to ship',
    'in hand',
    'limited stock',
    'fresh stock',
    'heavy stock',
  ];

  private static outOfStockKeywords = [
    'out of stock',
    'sold out',
    'no stock',
    'stock finished',
    'finished',
    'booking closed',
    'end of stock',
    'nil stock',
    'cleared out',
    'unavailable',
  ];

  private static comingSoonKeywords = [
    'coming soon',
    'arriving soon',
    'pre order',
    'pre-order',
    'upcoming',
    'next week',
  ];

  /**
   * Detects the stock status of a Telegram supplier post.
   * If uncertain, returns 'UNKNOWN' to ensure trust and avoid false stock claims.
   */
  public static detectStock(text: string): StockStatus {
    if (!text || typeof text !== 'string') {
      return 'UNKNOWN';
    }

    const lower = text.toLowerCase();

    // Check Out of Stock first
    for (const phrase of this.outOfStockKeywords) {
      if (lower.includes(phrase)) {
        return 'OUT_OF_STOCK';
      }
    }

    // Check Coming Soon
    for (const phrase of this.comingSoonKeywords) {
      if (lower.includes(phrase)) {
        return 'UNKNOWN';
      }
    }

    // Check In Stock
    for (const phrase of this.inStockKeywords) {
      if (lower.includes(phrase)) {
        return 'IN_STOCK';
      }
    }

    // If explicit price is mentioned and text doesn't say sold out, default to UNKNOWN or IN_STOCK if fresh post
    return 'UNKNOWN';
  }
}
