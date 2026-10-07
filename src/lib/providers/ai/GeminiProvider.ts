import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { AIProvider } from './AIProvider';
import { MockGeminiProvider } from './MockGeminiProvider';
import { ProductAIAnalysisResult } from '@/types/supplierSearch';

const ProductAnalysisSchema = z.object({
  productName: z.string().default(''),
  category: z.string().default('General Merchandise'),
  brand: z.string().default('Generic'),
  model: z.string().default(''),
  color: z.string().optional().default(''),
  material: z.string().optional().default(''),
  attributes: z.record(z.string(), z.string()).default({}),
  keywords: z.array(z.string()).default([]),
  searchQueries: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100).default(85),
});

const ComplexPostSchema = z.object({
  productName: z.string().default(''),
  price: z.number().default(0),
  currency: z.string().default('INR'),
  moq: z.number().default(1),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN']).default('UNKNOWN'),
  location: z.string().optional().default(''),
});

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private fallbackMock: MockGeminiProvider;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.fallbackMock = new MockGeminiProvider();
    if (this.apiKey && !this.apiKey.includes('your_') && !this.apiKey.includes('dummy')) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
      } catch {
        this.genAI = null;
      }
    }
  }

  public async analyzeProduct(params: {
    imageBase64?: string;
    mimeType?: string;
    productName?: string;
    rawText?: string;
  }): Promise<ProductAIAnalysisResult> {
    if (!this.genAI) {
      return this.fallbackMock.analyzeProduct(params);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `You are an expert e-commerce wholesale sourcing analyst. 
Analyze the provided product image and/or product name: "${params.productName || ''}".
Extract detailed product specifications, category, brand, model number, colors, materials, attributes, relevant wholesale search keywords, and high-precision search queries suitable for Telegram wholesale supplier channels.

Return ONLY a JSON object matching this schema:
{
  "productName": "Clean standardized product name",
  "category": "E-commerce category (e.g. Mobile Accessories, Electronics, Home & Kitchen)",
  "brand": "Brand name or Generic",
  "model": "Specific model number/name (e.g. iPhone 15, Galaxy S24, M34)",
  "color": "Color if identifiable",
  "material": "Material (e.g. TPU, Silicone, Glass, Cotton)",
  "attributes": { "key": "value" },
  "keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "searchQueries": ["query 1", "query 2", "query 3"],
  "confidence": 95
}`;

      const contents: any[] = [{ text: prompt }];

      if (params.imageBase64) {
        const cleanBase64 = params.imageBase64.includes('base64,')
          ? params.imageBase64.split('base64,')[1]
          : params.imageBase64;

        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: params.mimeType || 'image/jpeg',
          },
        });
      }

      const result = await model.generateContent(contents);
      const responseText = result.response.text();

      // Validate with Zod
      const parsedJson = JSON.parse(responseText);
      const validated = ProductAnalysisSchema.parse(parsedJson);

      return validated;
    } catch (error: any) {
      console.error('[GeminiProvider] Error during analyzeProduct:', error.message);
      // Fallback deterministic structure
      return {
        productName: params.productName || 'Analyzed Product',
        category: 'General Wholesale',
        brand: 'Generic',
        model: params.productName?.split(' ')[0] || '',
        color: '',
        material: '',
        attributes: {},
        keywords: [params.productName || 'wholesale product'].filter(Boolean),
        searchQueries: [`${params.productName || 'product'} wholesale`, `${params.productName || 'product'} supplier`],
        confidence: 60,
      };
    }
  }

  public async parseComplexPost(postText: string): Promise<{
    productName: string;
    price: number;
    currency: string;
    moq: number;
    stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
    location?: string;
  }> {
    if (!this.genAI) {
      return this.fallbackMock.parseComplexPost(postText);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `Extract wholesale supplier product information from this Indian wholesale Telegram post:
"""
${postText}
"""

Return a JSON object:
{
  "productName": "Name of product",
  "price": 35.0, // Unit price in INR. If bulk price like 350 for 10 pcs, compute unit price = 35.0
  "currency": "INR",
  "moq": 10, // Minimum order quantity
  "stockStatus": "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN",
  "location": "Surat / Delhi / Mumbai / etc if mentioned"
}`;

      const result = await model.generateContent([{ text: prompt }]);
      const parsed = JSON.parse(result.response.text());
      return ComplexPostSchema.parse(parsed);
    } catch (err: any) {
      console.warn('[GeminiProvider] Complex post parsing failed, falling back:', err.message);
      return {
        productName: postText.slice(0, 40),
        price: 0,
        currency: 'INR',
        moq: 1,
        stockStatus: 'UNKNOWN',
      };
    }
  }

  public async matchSemanticScore(productName: string, postText: string): Promise<number> {
    if (!this.genAI) return 70;

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `Rate the wholesale match compatibility between Target Amazon Product: "${productName}" and Telegram Post: "${postText.slice(0, 300)}".
Return a JSON object: { "score": 85 } where score is integer from 0 to 100.`;

      const result = await model.generateContent([{ text: prompt }]);
      const parsed = JSON.parse(result.response.text());
      const score = Number(parsed.score);
      return isNaN(score) ? 75 : Math.min(100, Math.max(0, score));
    } catch {
      return 70;
    }
  }
}
