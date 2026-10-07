import { ProductAIAnalysisResult } from '@/types/supplierSearch';

export interface AIProvider {
  /**
   * Analyzes an uploaded product image and/or text input to extract brand, model, category, attributes, keywords, and search queries.
   */
  analyzeProduct(params: {
    imageBase64?: string;
    mimeType?: string;
    productName?: string;
    rawText?: string;
  }): Promise<ProductAIAnalysisResult>;

  /**
   * Parses an unstructured, messy Telegram post when deterministic regex needs fallback.
   */
  parseComplexPost(postText: string): Promise<{
    productName: string;
    price: number;
    currency: string;
    moq: number;
    stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
    location?: string;
  }>;

  /**
   * Evaluates compatibility and semantic match between a target Amazon product and Telegram post.
   */
  matchSemanticScore(productName: string, postText: string): Promise<number>;
}
