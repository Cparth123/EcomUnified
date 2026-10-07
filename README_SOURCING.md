# Telegram Wholesale Sourcing Engine for Amazon Sellers

A production-ready SaaS module integrated into **EcomUnified** that discovers the cheapest wholesale suppliers and products from Telegram channels based on Amazon products or incoming orders.

---

## 🌟 Key Features

### 1. Manual Mode (Available by Default)
* **Multimodal Image & Text Search**: Upload Amazon product images (with Google Gemini vision analysis) or enter product names, ASINs, SKUs, models, and custom keywords.
* **Telegram Channel Mapping**: Checks user-configured supplier channels and product mappings first, then searches active public channels.
* **Deterministic + AI Post Parsing**: Automatically parses complex Indian wholesale price notations:
  * `₹35 / piece`, `Rs. 35`, `35/-`
  * `₹350 for 10 pcs` → Normalized to `₹35/unit`
  * `Box of 50 for 1600` → Normalized to `₹32/unit`
* **Real-time Stock Detection**: Accurately flags `IN_STOCK`, `OUT_OF_STOCK`, or `UNKNOWN` (no false claims).
* **Multi-factor Match Scoring (0–100%)**: Evaluates model exactness, brand compatibility, attributes, and keyword overlap.
* **Low-to-High Sorting & Highlighting**:
  * 🏆 **Best Available**: Highest accuracy match among in-stock suppliers.
  * 📉 **Lowest Price**: Minimum normalized unit price.
  * 🎯 **Best Match**: Highest attribute match.
* **Direct Telegram Post Links**: Immediate one-click `[Open Telegram Post]` button linking to `https://t.me/...`.

---

### 2. Amazon Auto Mode (Future Feature / Ready-to-use Pipeline)
* **Official Amazon SP-API Architecture**: Built with LWA OAuth token exchange and Orders API integration.
* **Automated Order Pipeline**:
  $$\text{Amazon Order} \rightarrow \text{Product Extraction} \rightarrow \text{AI / Keyword Enrichment} \rightarrow \text{Telegram Search} \rightarrow \text{Price Parsing} \rightarrow \text{Ranking} \rightarrow \text{Margin Realization}$$
* **Profit Margin Delta**: Computes profit spread: $\text{Selling Price} - \text{Wholesale Sourced Cost}$.
* **In-App Alerts**: Instant notifications when new Amazon orders are matched with wholesale suppliers.

---

### 3. Supplier Channel Management & Excel Import
* **Channel Database**: Manage `@mobile_wholesale`, `@surat_mobile`, `@iphone_accessories`, `@mumbai_electronics_wholesale`, etc.
* **Product-to-Channel Mappings**: Map specific product lines to top wholesale distributors.
* **Excel / CSV Bulk Importer**: Drag-and-drop `.xlsx` / `.csv` file upload with automatic column normalization (`product_name`, `telegram_channel`, `keywords`, `category`, `priority`), validation preview, error reporting, and one-click import.

---

## 🏛️ Architecture & Modularity

```
src/
├── app/
│   ├── search/                   # Manual product search UI
│   │   └── [id]/                 # Low-to-High price comparison results
│   ├── orders/                   # Amazon Order Pipeline & Auto Sourcing
│   ├── suppliers/                # Channel Management & Excel Import
│   ├── history/                  # Sourcing History & Audit Logs
│   ├── integrations/amazon/      # Amazon SP-API Connect & Credentials
│   ├── settings/automation/      # Auto Mode triggers & thresholds
│   ├── notifications/            # Real-time In-App Notification Center
│   └── api/                      # REST API endpoints
├── lib/
│   ├── providers/
│   │   ├── marketplace/          # AmazonSellerProvider, MockAmazonProvider
│   │   ├── telegram/             # GramJSTelegramProvider, MockTelegramProvider
│   │   └── ai/                   # GeminiProvider, MockGeminiProvider
│   └── services/
│       ├── PriceExtractionService.ts
│       ├── StockDetectionService.ts
│       ├── ProductMatchingService.ts
│       ├── SupplierSearchService.ts
│       ├── OrderSyncService.ts
│       ├── SupplierMappingService.ts
│       └── NotificationService.ts
└── types/
    └── supplierSearch.ts
```

---

## ⚙️ Environment Variables

Create or update `.env.local`:

```env
# AI Integration
GEMINI_API_KEY=your_gemini_api_key
USE_MOCK_GEMINI=true

# Telegram Integration
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
TELEGRAM_SESSION=your_telegram_session_string
USE_MOCK_TELEGRAM=true

# Amazon SP-API Integration
AMAZON_CLIENT_ID=your_lwa_client_id
AMAZON_CLIENT_SECRET=your_lwa_client_secret
AMAZON_REFRESH_TOKEN=your_lwa_refresh_token
AMAZON_SELLER_ID=your_merchant_id
AMAZON_MARKETPLACE_ID=A21TJRUUN4KGV
USE_MOCK_AMAZON=true
```

Set `USE_MOCK_*=false` in production when official credentials are provided.
