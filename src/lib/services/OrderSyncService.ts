import { AmazonSellerProvider } from '@/lib/providers/marketplace/AmazonSellerProvider';
import { MockAmazonProvider } from '@/lib/providers/marketplace/MockAmazonProvider';
import { MarketplaceProvider, MarketplaceOrder } from '@/lib/providers/marketplace/MarketplaceProvider';
import { supplierSearchService } from './SupplierSearchService';
import { supplierStore } from '@/lib/supplierStore';
import { notificationService } from './NotificationService';
import { AmazonOrderPipelineItem } from '@/types/supplierSearch';

export class OrderSyncService {
  private amazonProvider: MarketplaceProvider;

  constructor() {
    const useMock = process.env.USE_MOCK_AMAZON === 'true' || !process.env.AMAZON_CLIENT_ID;
    this.amazonProvider = useMock ? new MockAmazonProvider() : new AmazonSellerProvider();
  }

  /**
   * Synchronizes orders from Amazon SP-API and runs Telegram Supplier search on new/unprocessed orders.
   */
  public async syncAmazonOrders(): Promise<{
    syncedCount: number;
    matchedCount: number;
    orders: AmazonOrderPipelineItem[];
  }> {
    const rawOrders: MarketplaceOrder[] = await this.amazonProvider.getOrders();
    const settings = supplierStore.getAutomationSettings();

    let matchedCount = 0;
    const processedOrders: AmazonOrderPipelineItem[] = [];

    for (const rawOrder of rawOrders) {
      // Check if already in pipeline
      let pipelineItem = supplierStore.getPipelineOrderById(rawOrder.orderId);

      if (!pipelineItem) {
        // Create new pipeline entry
        pipelineItem = {
          id: `pipe_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          amazonOrderId: rawOrder.orderId,
          marketplaceId: rawOrder.marketplaceId,
          sellerSku: rawOrder.sku,
          asin: rawOrder.asin || 'B0CHX1W3F9',
          productName: rawOrder.productName,
          quantity: rawOrder.quantity,
          sellingPrice: rawOrder.itemPrice,
          imageUrl: rawOrder.imageUrl,
          orderDate: rawOrder.orderDate,
          status: rawOrder.orderStatus,
          autoSearchStatus: 'NOT_STARTED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        supplierStore.addPipelineOrder(pipelineItem);
      }

      // If Auto Mode & Auto Telegram Search is enabled, run search if not already matched
      if (
        settings.autoOrderMonitoring &&
        settings.autoSearchTelegram &&
        pipelineItem.autoSearchStatus !== 'MATCHED'
      ) {
        supplierStore.updatePipelineOrder(pipelineItem.id, {
          autoSearchStatus: 'SEARCHING',
        });

        try {
          const searchJob = await supplierSearchService.executeSearch({
            productName: pipelineItem.productName,
            sku: pipelineItem.sellerSku,
            asin: pipelineItem.asin,
            minMatchScore: settings.minMatchScore || 70,
            onlyInStock: settings.onlyInStockSuppliers,
            maxResults: settings.maxTelegramResults || 50,
          });

          const bestMatch = searchJob.results.find(
            r => r.normalizedUnitPrice > 0 && (!settings.onlyInStockSuppliers || r.stockStatus === 'IN_STOCK')
          );

          if (bestMatch) {
            matchedCount++;
            const profitPerUnit = Math.max(0, pipelineItem.sellingPrice - bestMatch.normalizedUnitPrice);
            const margin = pipelineItem.sellingPrice > 0 ? (profitPerUnit / pipelineItem.sellingPrice) * 100 : 0;

            const updated = supplierStore.updatePipelineOrder(pipelineItem.id, {
              searchJobId: searchJob.id,
              bestSupplierMatch: bestMatch,
              autoSearchStatus: 'MATCHED',
              potentialProfitPerUnit: Math.round(profitPerUnit),
              sourcingMarginPercent: Math.round(margin * 10) / 10,
            });

            if (updated) {
              processedOrders.push(updated);
            }

            // Trigger notification
            if (settings.inAppNotifications) {
              notificationService.addNotification({
                title: `Amazon Order Synced: #${pipelineItem.amazonOrderId}`,
                message: `Matched ${pipelineItem.productName.slice(0, 30)}... with ${bestMatch.supplierName} @ ₹${bestMatch.normalizedUnitPrice}/unit (IN STOCK). Margin: ${Math.round(margin)}%`,
                type: 'order_match',
                orderId: pipelineItem.amazonOrderId,
                supplierName: bestMatch.supplierName,
                price: bestMatch.normalizedUnitPrice,
                telegramPostUrl: bestMatch.telegramPostUrl,
              });
            }
          } else {
            const updated = supplierStore.updatePipelineOrder(pipelineItem.id, {
              searchJobId: searchJob.id,
              autoSearchStatus: 'NO_MATCH',
            });
            if (updated) processedOrders.push(updated);
          }
        } catch (err: any) {
          console.error(`[OrderSyncService] Error auto-searching for order ${pipelineItem.amazonOrderId}:`, err);
          supplierStore.updatePipelineOrder(pipelineItem.id, {
            autoSearchStatus: 'NO_MATCH',
          });
        }
      } else {
        processedOrders.push(pipelineItem);
      }
    }

    return {
      syncedCount: rawOrders.length,
      matchedCount,
      orders: supplierStore.getPipelineOrders(),
    };
  }
}

export const orderSyncService = new OrderSyncService();
