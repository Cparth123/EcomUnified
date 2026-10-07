import { AIProvider } from './AIProvider';
import { ProductAIAnalysisResult } from '@/types/supplierSearch';
import { PriceExtractionService } from '@/lib/services/PriceExtractionService';
import { StockDetectionService } from '@/lib/services/StockDetectionService';

export class MockGeminiProvider implements AIProvider {
  public async analyzeProduct(params: {
    imageBase64?: string;
    mimeType?: string;
    productName?: string;
    rawText?: string;
  }): Promise<ProductAIAnalysisResult> {
    const raw = (params.productName || 'iPhone 15 Transparent Mobile Cover').trim();
    
    // Deterministic intelligence based on input keywords
    let category = 'Mobile Accessories';
    let brand = 'Generic';
    let model = 'iPhone 15';
    let color = 'Transparent';
    let material = 'TPU Silicone';

    const lower = raw.toLowerCase();

    if (lower.includes('s24') || lower.includes('samsung')) {
      model = 'Galaxy S24';
      brand = 'Samsung';
    } else if (lower.includes('airpods') || lower.includes('earbuds') || lower.includes('earphone')) {
      category = 'Audio & Wearables';
      model = 'AirPods Pro 2 / TWS';
      material = 'Polycarbonate';
    } else if (lower.includes('watch') || lower.includes('smartwatch')) {
      category = 'Wearable Technology';
      model = 'Ultra Smartwatch Strap';
    } else if (lower.includes('glass') || lower.includes('tempered')) {
      category = 'Screen Protectors';
      model = '9D Edge-to-Edge Tempered Glass';
      material = 'Tempered Glass';
    } else if (lower.includes('cable') || lower.includes('charger') || lower.includes('adapter')) {
      category = 'Cables & Charging';
      model = 'Type-C to Lightning Fast Cable';
    } else if (lower.includes('iphone 15') || lower.includes('iphone')) {
      model = 'iPhone 15';
      brand = 'Apple Compatible';
    }

    const keywords = [
      `${model} cover`,
      `${model} case`,
      `${model} wholesale`,
      `${color} ${model} cover`,
      `${category.toLowerCase()} surat wholesale`,
    ];

    const searchQueries = [
      `${model} cover wholesale`,
      `${model} case ready stock`,
      `${model} transparent`,
      `${model} cover surat`,
      `${model} accessories`,
    ];

    return {
      productName: raw || `${model} ${color} ${category}`,
      category,
      brand,
      model,
      color,
      material,
      attributes: {
        Compatibility: model,
        Finish: 'Glossy / Anti-Yellowing',
        Protection: 'Drop & Shock Proof',
        WholesaleOrigin: 'Surat / Delhi Gaffer Market',
      },
      keywords,
      searchQueries,
      confidence: 94,
    };
  }

  public async parseComplexPost(postText: string): Promise<{
    productName: string;
    price: number;
    currency: string;
    moq: number;
    stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
    location?: string;
  }> {
    const priceInfo = PriceExtractionService.extractPrice(postText);
    const stock = StockDetectionService.detectStock(postText);

    let location = 'Surat Wholesale Hub';
    if (postText.toLowerCase().includes('delhi') || postText.toLowerCase().includes('gaffar')) {
      location = 'Delhi Karol Bagh';
    } else if (postText.toLowerCase().includes('mumbai')) {
      location = 'Mumbai Manish Market';
    }

    const firstLine = postText.split('\n')[0]?.trim() || 'Wholesale Item';

    return {
      productName: firstLine.slice(0, 50),
      price: priceInfo.normalizedUnitPrice,
      currency: priceInfo.currency,
      moq: priceInfo.moq,
      stockStatus: stock,
      location,
    };
  }

  public async matchSemanticScore(productName: string, postText: string): Promise<number> {
    const pTokens = productName.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const tLower = postText.toLowerCase();
    const matched = pTokens.filter(t => tLower.includes(t));
    if (pTokens.length === 0) return 70;
    const ratio = matched.length / pTokens.length;
    return Math.round(50 + (ratio * 45));
  }
}
