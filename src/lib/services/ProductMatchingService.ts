import { TelegramSearchResult, StockStatus } from '@/types/supplierSearch';

export interface MatchingCriteria {
  productName: string;
  brand?: string;
  model?: string;
  category?: string;
  sku?: string;
  asin?: string;
  keywords?: string[];
}

export class ProductMatchingService {
  /**
   * Calculates a match score between 0 and 100% based on multiple attribute criteria.
   */
  public static calculateMatchScore(criteria: MatchingCriteria, postText: string): number {
    if (!postText || (!criteria.productName && !criteria.model && (!criteria.keywords || criteria.keywords.length === 0))) {
      return 0;
    }

    const textLower = postText.toLowerCase();
    let score = 0;
    let maxPossible = 0;

    // 1. Model match (Weight: 35 points)
    if (criteria.model && criteria.model.trim()) {
      maxPossible += 35;
      const modelLower = criteria.model.toLowerCase().trim();
      if (textLower.includes(modelLower)) {
        score += 35;
      } else {
        // Partial model token match
        const modelTokens = modelLower.split(/\s+/).filter(t => t.length > 1);
        const matchedTokens = modelTokens.filter(t => textLower.includes(t));
        if (modelTokens.length > 0) {
          score += (matchedTokens.length / modelTokens.length) * 25;
        }
      }
    }

    // 2. Product Name tokens & exact phrases (Weight: 30 points)
    if (criteria.productName && criteria.productName.trim()) {
      maxPossible += 30;
      const nameLower = criteria.productName.toLowerCase().trim();
      if (textLower.includes(nameLower)) {
        score += 30;
      } else {
        // Tokenize product name (remove noise words)
        const stopWords = new Set(['for', 'the', 'and', 'with', 'in', 'of', 'a', 'an', 'to', 'pcs', 'pack', 'combo']);
        const tokens = nameLower
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(t => t.length > 2 && !stopWords.has(t));

        if (tokens.length > 0) {
          const matched = tokens.filter(t => textLower.includes(t));
          score += (matched.length / tokens.length) * 30;
        }
      }
    }

    // 3. Brand match (Weight: 15 points)
    if (criteria.brand && criteria.brand.trim() && criteria.brand.toLowerCase() !== 'generic') {
      maxPossible += 15;
      const brandLower = criteria.brand.toLowerCase().trim();
      const isApple = (brandLower.includes('apple') || brandLower.includes('ios')) && textLower.includes('iphone');
      const isSamsung = brandLower.includes('samsung') && textLower.includes('galaxy');
      
      if (textLower.includes(brandLower) || isApple || isSamsung) {
        score += 15;
      }
    }

    // 4. Category & Keyword matches (Weight: 20 points)
    const keywords = [
      ...(criteria.keywords || []),
      criteria.category || '',
    ].filter(k => k && k.trim());

    if (keywords.length > 0) {
      maxPossible += 20;
      let kwScore = 0;
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase().trim();
        if (textLower.includes(kwLower)) {
          kwScore += 20 / Math.min(keywords.length, 3);
        } else {
          // Token level match for multi-word keywords
          const kwTokens = kwLower.split(/\s+/).filter(t => t.length > 2);
          const matchedKwTokens = kwTokens.filter(t => textLower.includes(t));
          if (kwTokens.length > 0 && matchedKwTokens.length === kwTokens.length) {
            kwScore += 20 / Math.min(keywords.length, 3);
          } else if (kwTokens.length > 0 && matchedKwTokens.length > 0) {
            kwScore += (matchedKwTokens.length / kwTokens.length) * (15 / Math.min(keywords.length, 3));
          }
        }
      }
      score += Math.min(kwScore, 20);
    }

    // Default normalization
    if (maxPossible === 0) {
      return 50;
    }

    let finalScore = Math.round((score / maxPossible) * 100);

    // Negative model penalty: If searching for "iPhone 15" and text says "iPhone 14" or "iPhone 13" only
    if (criteria.model) {
      const modelNumMatch = criteria.model.match(/\d+/);
      if (modelNumMatch) {
        const targetNum = modelNumMatch[0];
        // If post mentions other numbers like 14, 13, 12, 11, 16 but not targetNum
        const otherNumberMatch = textLower.match(/(?:iphone|galaxy|s|note|pro|pixel)\s*(\d+)/i);
        if (otherNumberMatch && otherNumberMatch[1] !== targetNum && !textLower.includes(targetNum)) {
          finalScore = Math.max(10, finalScore - 40);
        }
      }
    }

    return Math.min(100, Math.max(0, finalScore));
  }

  /**
   * Sorts and labels search results for "Best Match", "Lowest Price", and "Best Available".
   */
  public static rankResults(
    results: TelegramSearchResult[],
    sortOption: 'lowest_price' | 'highest_price' | 'best_match' | 'newest' | 'in_stock_first' = 'lowest_price',
    minScoreThreshold: number = 50
  ): TelegramSearchResult[] {
    if (!results || results.length === 0) return [];

    // Filter by threshold
    let filtered = results.filter(r => r.matchScore >= minScoreThreshold);
    if (filtered.length === 0) {
      filtered = [...results];
    }

    // Identify Lowest Price (among items with valid price > 0)
    const validPrices = filtered.filter(r => r.normalizedUnitPrice > 0);
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(r => r.normalizedUnitPrice)) : 0;

    // Identify Best Match
    const maxScore = Math.max(...filtered.map(r => r.matchScore));

    // Identify Best Available (highest match score among IN_STOCK items with reasonable price)
    const inStockItems = filtered.filter(r => r.stockStatus === 'IN_STOCK' && r.normalizedUnitPrice > 0);
    const bestInStockScore = inStockItems.length > 0 ? Math.max(...inStockItems.map(r => r.matchScore)) : 0;

    // Apply tags
    const tagged = filtered.map(r => {
      const isLowest = r.normalizedUnitPrice > 0 && r.normalizedUnitPrice === minPrice;
      const isBest = r.matchScore === maxScore && r.matchScore >= 75;
      const isBestAvail = r.stockStatus === 'IN_STOCK' && r.matchScore === bestInStockScore && bestInStockScore >= 70;

      return {
        ...r,
        isLowestPrice: isLowest,
        isBestMatch: isBest,
        isBestAvailable: isBestAvail,
      };
    });

    // Sort
    return tagged.sort((a, b) => {
      switch (sortOption) {
        case 'lowest_price':
          // Price ascending, but prioritize valid prices
          if (a.normalizedUnitPrice === 0) return 1;
          if (b.normalizedUnitPrice === 0) return -1;
          return a.normalizedUnitPrice - b.normalizedUnitPrice;

        case 'highest_price':
          return b.normalizedUnitPrice - a.normalizedUnitPrice;

        case 'best_match':
          return b.matchScore - a.matchScore;

        case 'in_stock_first':
          const statusOrder: Record<StockStatus, number> = {
            IN_STOCK: 1,
            UNKNOWN: 2,
            OUT_OF_STOCK: 3,
          };
          if (statusOrder[a.stockStatus] !== statusOrder[b.stockStatus]) {
            return statusOrder[a.stockStatus] - statusOrder[b.stockStatus];
          }
          return a.normalizedUnitPrice - b.normalizedUnitPrice;

        case 'newest':
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();

        default:
          return a.normalizedUnitPrice - b.normalizedUnitPrice;
      }
    });
  }
}
