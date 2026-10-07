import {
  SearchQueryInput,
  SearchJob,
  TelegramSearchResult,
  SupplierChannel,
} from '@/types/supplierSearch';
import { GeminiProvider } from '@/lib/providers/ai/GeminiProvider';
import { MockGeminiProvider } from '@/lib/providers/ai/MockGeminiProvider';
import { AIProvider } from '@/lib/providers/ai/AIProvider';
import { GramJSTelegramProvider } from '@/lib/providers/telegram/GramJSTelegramProvider';
import { MockTelegramProvider } from '@/lib/providers/telegram/MockTelegramProvider';
import { TelegramProvider } from '@/lib/providers/telegram/TelegramProvider';
import { PriceExtractionService } from './PriceExtractionService';
import { StockDetectionService } from './StockDetectionService';
import { ProductMatchingService } from './ProductMatchingService';
import { supplierStore } from '@/lib/supplierStore';
import { notificationService } from './NotificationService';

export class SupplierSearchService {
  private aiProvider: AIProvider;
  private telegramProvider: TelegramProvider;

  constructor() {
    const useMockGemini = process.env.USE_MOCK_GEMINI === 'true' || !process.env.GEMINI_API_KEY;
    const useMockTelegram = process.env.USE_MOCK_TELEGRAM === 'true';

    this.aiProvider = useMockGemini ? new MockGeminiProvider() : new GeminiProvider();
    this.telegramProvider = useMockTelegram ? new MockTelegramProvider() : new GramJSTelegramProvider();
  }

  /**
   * Executes full product search pipeline across Telegram wholesale suppliers.
   */
  public async executeSearch(
    input: SearchQueryInput,
    onProgress?: (progress: number, message: string) => void
  ): Promise<SearchJob> {
    const job = supplierStore.createSearchJob({
      productName: input.productName || 'Wholesale Sourcing Search',
      imageUrl: input.imageUrl,
      sku: input.sku,
      asin: input.asin,
      brand: input.brand,
      model: input.model,
      category: input.category,
      keywords: input.additionalKeywords || [],
      status: 'PROCESSING',
      progress: 10,
      progressMessage: 'Initializing AI analysis...',
      results: [],
      totalResultsCount: 0,
    });

    try {
      // Step 1: AI Product Analysis if image or name provided
      onProgress?.(20, 'Analyzing product with AI...');
      supplierStore.updateSearchJob(job.id, {
        progress: 20,
        progressMessage: 'Extracting product attributes & keywords with Gemini AI...',
      });

      let analyzedKeywords: string[] = input.additionalKeywords || [];
      let detectedCategory = input.category || '';
      let detectedModel = input.model || '';
      let detectedBrand = input.brand || '';
      let searchQueries: string[] = [];

      try {
        const aiResult = await this.aiProvider.analyzeProduct({
          imageBase64: input.imageBufferBase64,
          productName: input.productName,
        });

        detectedCategory = detectedCategory || aiResult.category;
        detectedModel = detectedModel || aiResult.model;
        detectedBrand = detectedBrand || aiResult.brand;
        analyzedKeywords = Array.from(new Set([...analyzedKeywords, ...aiResult.keywords]));
        searchQueries = aiResult.searchQueries;
      } catch (err: any) {
        console.warn('[SupplierSearchService] AI Analysis warning:', err.message);
        searchQueries = [input.productName || 'mobile cover wholesale'];
      }

      // Step 2: Channel Identification via Mapping & Active DB
      onProgress?.(40, 'Identifying relevant wholesale supplier channels...');
      supplierStore.updateSearchJob(job.id, {
        progress: 40,
        progressMessage: 'Mapping target channels from supplier database...',
      });

      const allChannels = supplierStore.getChannels().filter(c => c.isActive);
      const mappings = supplierStore.getMappings();

      // Check direct product mappings
      const matchedMappingChannels = new Set<string>();
      const targetQuery = (input.productName || detectedModel || '').toLowerCase();

      mappings.forEach(m => {
        if (
          targetQuery.includes(m.productName.toLowerCase()) ||
          m.productName.toLowerCase().includes(targetQuery) ||
          m.keywords.some(k => targetQuery.includes(k.toLowerCase()))
        ) {
          matchedMappingChannels.add(m.supplierChannelUsername);
        }
      });

      // Target channels list: mapped channels first, then active category channels
      const targetChannels: SupplierChannel[] = [];
      allChannels.forEach(chan => {
        if (matchedMappingChannels.has(chan.username)) {
          targetChannels.unshift(chan);
        } else if (!detectedCategory || chan.category.toLowerCase().includes(detectedCategory.toLowerCase()) || chan.category === 'General Merchandise') {
          targetChannels.push(chan);
        }
      });

      // Fallback if none matched
      const channelsToSearch = targetChannels.length > 0 ? targetChannels : allChannels;

      // Step 3: Telegram Search
      onProgress?.(60, 'Searching Telegram wholesale channels...');
      supplierStore.updateSearchJob(job.id, {
        progress: 60,
        progressMessage: `Searching ${channelsToSearch.length} Telegram supplier channels...`,
      });

      const rawPosts: any[] = [];
      const primaryQuery = searchQueries[0] || input.productName || detectedModel || 'cover';

      for (const channel of channelsToSearch.slice(0, 8)) {
        try {
          const posts = await this.telegramProvider.searchChannelPosts(
            channel.username,
            primaryQuery,
            15
          );
          posts.forEach(p => {
            rawPosts.push({
              ...p,
              channelName: channel.name,
              channelLocation: channel.location,
              contactNumber: channel.contactNumber,
            });
          });
        } catch (e: any) {
          console.warn(`[SupplierSearchService] Error querying ${channel.username}:`, e.message);
        }
      }

      // If channel search yielded few posts, fallback to public Telegram search
      if (rawPosts.length < 3) {
        try {
          const publicPosts = await this.telegramProvider.searchPublicPosts(primaryQuery, 20);
          publicPosts.forEach(p => {
            rawPosts.push({
              ...p,
              channelName: `${p.channelUsername.replace('@', '')} Wholesale`,
              channelLocation: 'India Wholesale Hub',
            });
          });
        } catch (err: any) {
          console.warn('[SupplierSearchService] Public search error:', err.message);
        }
      }

      // Step 4: Parse Prices, Stock, and Calculate Match Scores
      onProgress?.(80, 'Extracting wholesale prices & detecting stock...');
      supplierStore.updateSearchJob(job.id, {
        progress: 80,
        progressMessage: 'Extracting unit pricing, MOQs, and stock availability...',
      });

      const parsedResults: TelegramSearchResult[] = [];

      for (const item of rawPosts) {
        const priceInfo = PriceExtractionService.extractPrice(item.rawText);
        const stockStatus = StockDetectionService.detectStock(item.rawText);

        const matchScore = ProductMatchingService.calculateMatchScore(
          {
            productName: input.productName || detectedModel,
            brand: detectedBrand,
            model: detectedModel,
            category: detectedCategory,
            sku: input.sku,
            asin: input.asin,
            keywords: analyzedKeywords,
          },
          item.rawText
        );

        parsedResults.push({
          id: `res_${job.id}_${item.id || Math.random().toString(36).substr(2, 6)}`,
          searchId: job.id,
          productName: item.rawText.split('\n')[0]?.trim().slice(0, 60) || input.productName || 'Wholesale Product',
          price: priceInfo.normalizedUnitPrice,
          originalPriceText: priceInfo.originalPriceText,
          normalizedUnitPrice: priceInfo.normalizedUnitPrice,
          currency: priceInfo.currency,
          moq: priceInfo.moq,
          stockStatus,
          location: item.channelLocation || 'Surat / Delhi',
          supplierName: item.channelName || item.channelUsername,
          telegramChannel: item.channelUsername,
          telegramPostUrl: item.postUrl,
          contactNumber: item.contactNumber,
          matchScore,
          postedAt: item.postedAt,
          originalText: item.rawText,
          mediaUrl: item.mediaUrl,
        });
      }

      // Step 5: Rank & Filter
      const rankedResults = ProductMatchingService.rankResults(
        parsedResults,
        'lowest_price',
        input.minMatchScore || 40
      );

      const lowestPriceResult = rankedResults.find(r => r.normalizedUnitPrice > 0);
      const lowestPrice = lowestPriceResult ? lowestPriceResult.normalizedUnitPrice : 0;
      const bestSupplier = lowestPriceResult ? lowestPriceResult.supplierName : undefined;
      const bestMatchScore = rankedResults.length > 0 ? Math.max(...rankedResults.map(r => r.matchScore)) : 0;

      const completedJob = supplierStore.updateSearchJob(job.id, {
        status: 'COMPLETED',
        progress: 100,
        progressMessage: 'Search completed successfully.',
        results: rankedResults,
        totalResultsCount: rankedResults.length,
        lowestPrice,
        bestSupplier,
        bestMatchScore,
        completedAt: new Date().toISOString(),
      });

      // Dispatch Notification if a great price is found
      if (lowestPrice > 0 && bestSupplier) {
        notificationService.addNotification({
          title: `Wholesale Opportunity Found: ${input.productName || 'Product'}`,
          message: `Found at ₹${lowestPrice}/unit from ${bestSupplier}. Match score: ${bestMatchScore}%`,
          type: 'order_match',
          searchId: job.id,
          supplierName: bestSupplier,
          price: lowestPrice,
          telegramPostUrl: lowestPriceResult?.telegramPostUrl,
        });
      }

      onProgress?.(100, 'Search complete.');
      return completedJob || job;
    } catch (error: any) {
      console.error('[SupplierSearchService] Search failed:', error);
      const failedJob = supplierStore.updateSearchJob(job.id, {
        status: 'FAILED',
        progress: 100,
        progressMessage: 'Search encountered an error.',
        error: error.message || 'Unknown search error occurred',
      });
      return failedJob || job;
    }
  }
}

export const supplierSearchService = new SupplierSearchService();
