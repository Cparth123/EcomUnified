import { TelegramProvider, TelegramChannelInfo } from './TelegramProvider';
import { TelegramPost } from '@/types/supplierSearch';

export class MockTelegramProvider implements TelegramProvider {
  private mockPosts: Record<string, TelegramPost[]> = {
    '@mobile_wholesale': [
      {
        id: 'post_mw_101',
        channelUsername: '@mobile_wholesale',
        channelTitle: 'Surat Mobile Wholesale Hub',
        messageId: 1042,
        postUrl: 'https://t.me/mobile_wholesale/1042',
        rawText: `🔥 NEW ARRIVAL - IPHONE 15 TRANSPARENT TPU CLEAR COVER
✨ Premium Anti-Yellowing Acrylic Back + Soft TPU Bumper
Price: ₹35 / piece
MOQ: 10 pcs
Ready Stock Available for immediate dispatch 📦
Location: Surat Ring Road Market
WhatsApp: 9876543210
Direct Delivery all over India 🇮🇳`,
        postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'post_mw_102',
        channelUsername: '@mobile_wholesale',
        channelTitle: 'Surat Mobile Wholesale Hub',
        messageId: 1045,
        postUrl: 'https://t.me/mobile_wholesale/1045',
        rawText: `📱 iPhone 15 Frosted Matte Magnetic Magsafe Case
Wholesale Rate: ₹75/-
MOQ: 20 pcs
Colors: Black, Titanium Grey, Deep Blue
In Stock - Same Day Dispatch!
Location: Surat`,
        postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'post_mw_103',
        channelUsername: '@mobile_wholesale',
        channelTitle: 'Surat Mobile Wholesale Hub',
        messageId: 1048,
        postUrl: 'https://t.me/mobile_wholesale/1048',
        rawText: `⚡ 9D Full Glue Curved Edge Tempered Glass for iPhone 15 & 15 Pro
Bulk Pack: ₹350 for 10 pcs (₹35 each)
Stock Available: 5,000 units
Fast dispatch via BlueDart/DTDC`,
        postedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      },
      {
        id: 'post_mw_104',
        channelUsername: '@mobile_wholesale',
        channelTitle: 'Surat Mobile Wholesale Hub',
        messageId: 1050,
        postUrl: 'https://t.me/mobile_wholesale/1050',
        rawText: `❌ OUT OF STOCK: iPhone 15 Leather Wallet Pouch
Finished! Next batch coming in 2 weeks. Sold Out.`,
        postedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
    ],

    '@surat_mobile': [
      {
        id: 'post_sm_201',
        channelUsername: '@surat_mobile',
        channelTitle: 'Gujarat Mobile Accessories Direct',
        messageId: 2110,
        postUrl: 'https://t.me/surat_mobile/2110',
        rawText: `💎 SUPER DEAL: iPhone 15 Transparent Mobile Cover
Crystal Clear Cushion Shockproof
Wholesale ₹38 per piece
MOQ 15 pcs
Full Stock Ready to Ship 🚚
Location: Surat Textile & Tech Hub`,
        postedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'post_sm_202',
        channelUsername: '@surat_mobile',
        channelTitle: 'Gujarat Mobile Accessories Direct',
        messageId: 2115,
        postUrl: 'https://t.me/surat_mobile/2115',
        rawText: `🔊 TWS Wireless Earbuds Pro 2 with Active ANC Display
Wholesale Price: ₹380 / pc
MOQ: 5 pcs
Available - Surat Warehouse`,
        postedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
    ],

    '@iphone_accessories': [
      {
        id: 'post_ia_301',
        channelUsername: '@iphone_accessories',
        channelTitle: 'Delhi Gaffar Market Wholesalers',
        messageId: 3055,
        postUrl: 'https://t.me/iphone_accessories/3055',
        rawText: `🔥 iPhone 15 Transparent Ultra Slim TPU Back Cover
Rate: Rs. 42 / piece
MOQ: 50 pcs
Stock Available - Gaffar Market Karol Bagh, Delhi
Best Quality Guaranteed!`,
        postedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'post_ia_302',
        channelUsername: '@iphone_accessories',
        channelTitle: 'Delhi Gaffar Market Wholesalers',
        messageId: 3060,
        postUrl: 'https://t.me/iphone_accessories/3060',
        rawText: `🛑 iPhone 15 Pro Max Silicon Case with Logo
Price: ₹120/-
Status: Sold Out / Nil Stock! Booking closed.`,
        postedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
    ],

    '@mumbai_electronics_wholesale': [
      {
        id: 'post_me_401',
        channelUsername: '@mumbai_electronics_wholesale',
        channelTitle: 'Manish Market Wholesale Bazaar',
        messageId: 4120,
        postUrl: 'https://t.me/mumbai_electronics_wholesale/4120',
        rawText: `💥 SPECIAL LOT: iPhone 15 Clear Transparent TPU Back Cover
Box of 50 pcs for ₹1600 (Only ₹32 per pc!)
MOQ: 50 pcs
Ready Stock - Manish Market, Mumbai 🌟
Call/Telegram order now!`,
        postedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'post_me_402',
        channelUsername: '@mumbai_electronics_wholesale',
        channelTitle: 'Manish Market Wholesale Bazaar',
        messageId: 4125,
        postUrl: 'https://t.me/mumbai_electronics_wholesale/4125',
        rawText: `🔌 Braided 65W Fast Charging Type-C to Type-C Cable (1.5m)
Wholesale: ₹45 / piece
MOQ: 20 pcs
Ready Stock Available!`,
        postedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ],
  };

  public async searchChannelPosts(
    channelUsername: string,
    query: string,
    limit: number = 20
  ): Promise<TelegramPost[]> {
    const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
    const posts = this.mockPosts[normalizedChannel] || [];

    if (!query || query.trim() === '') {
      return posts.slice(0, limit);
    }

    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

    const matches = posts.filter(post => {
      const lower = post.rawText.toLowerCase();
      // Match if at least one meaningful token is found
      return queryTokens.some(token => lower.includes(token));
    });

    return (matches.length > 0 ? matches : posts).slice(0, limit);
  }

  public async searchPublicPosts(
    query: string,
    limit: number = 30
  ): Promise<TelegramPost[]> {
    const allPosts: TelegramPost[] = [];
    Object.values(this.mockPosts).forEach(list => allPosts.push(...list));

    if (!query || query.trim() === '') {
      return allPosts.slice(0, limit);
    }

    const queryTokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

    const matches = allPosts.filter(post => {
      const lower = post.rawText.toLowerCase();
      return queryTokens.some(token => lower.includes(token));
    });

    return (matches.length > 0 ? matches : allPosts).slice(0, limit);
  }

  public async getChannelPosts(
    channelUsername: string,
    limit: number = 20
  ): Promise<TelegramPost[]> {
    const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
    return (this.mockPosts[normalizedChannel] || []).slice(0, limit);
  }

  public async getChannelInfo(channelUsername: string): Promise<TelegramChannelInfo> {
    const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
    const posts = this.mockPosts[normalizedChannel];

    if (!posts) {
      return {
        username: normalizedChannel,
        title: `${normalizedChannel.replace('@', '')} Channel`,
        type: 'PUBLIC_CHANNEL',
        memberCount: 14500,
        accessible: true,
        statusMessage: 'Public channel connected and searchable.',
      };
    }

    return {
      username: normalizedChannel,
      title: posts[0]?.channelTitle || normalizedChannel,
      type: 'PUBLIC_CHANNEL',
      memberCount: 28400,
      accessible: true,
      statusMessage: 'Channel verified and active.',
    };
  }
}
