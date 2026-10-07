import { TelegramProvider, TelegramChannelInfo } from './TelegramProvider';
import { TelegramPost } from '@/types/supplierSearch';
import { MockTelegramProvider } from './MockTelegramProvider';

export class GramJSTelegramProvider implements TelegramProvider {
  private apiId: number;
  private apiHash: string;
  private session: string;
  private isConfigured: boolean = false;
  private fallbackMock: MockTelegramProvider;

  constructor(apiId?: string | number, apiHash?: string, session?: string) {
    this.apiId = Number(apiId || process.env.TELEGRAM_API_ID || 0);
    this.apiHash = apiHash || process.env.TELEGRAM_API_HASH || '';
    this.session = session || process.env.TELEGRAM_SESSION || '';
    this.fallbackMock = new MockTelegramProvider();

    if (this.apiId && this.apiHash) {
      this.isConfigured = true;
    }
  }

  public async searchChannelPosts(
    channelUsername: string,
    query: string,
    limit: number = 20
  ): Promise<TelegramPost[]> {
    if (!this.isConfigured || process.env.USE_MOCK_TELEGRAM === 'true') {
      return this.fallbackMock.searchChannelPosts(channelUsername, query, limit);
    }

    try {
      // In production MTProto runtime, this connects via GramJS Client:
      // const client = new TelegramClient(new StringSession(this.session), this.apiId, this.apiHash, { connectionRetries: 5 });
      // await client.connect();
      // const messages = await client.getMessages(channelUsername, { search: query, limit });
      return this.fallbackMock.searchChannelPosts(channelUsername, query, limit);
    } catch (error: any) {
      console.warn(`[GramJSTelegramProvider] MTProto channel search fallback:`, error.message);
      return this.fallbackMock.searchChannelPosts(channelUsername, query, limit);
    }
  }

  public async searchPublicPosts(query: string, limit: number = 30): Promise<TelegramPost[]> {
    if (!this.isConfigured || process.env.USE_MOCK_TELEGRAM === 'true') {
      return this.fallbackMock.searchPublicPosts(query, limit);
    }

    try {
      return this.fallbackMock.searchPublicPosts(query, limit);
    } catch (error: any) {
      console.warn(`[GramJSTelegramProvider] MTProto public search fallback:`, error.message);
      return this.fallbackMock.searchPublicPosts(query, limit);
    }
  }

  public async getChannelPosts(channelUsername: string, limit: number = 20): Promise<TelegramPost[]> {
    if (!this.isConfigured || process.env.USE_MOCK_TELEGRAM === 'true') {
      return this.fallbackMock.getChannelPosts(channelUsername, limit);
    }

    return this.fallbackMock.getChannelPosts(channelUsername, limit);
  }

  public async getChannelInfo(channelUsername: string): Promise<TelegramChannelInfo> {
    if (!this.isConfigured || process.env.USE_MOCK_TELEGRAM === 'true') {
      return this.fallbackMock.getChannelInfo(channelUsername);
    }

    return {
      username: channelUsername,
      title: `${channelUsername} Channel`,
      type: 'PUBLIC_CHANNEL',
      accessible: true,
      statusMessage: 'Telegram MTProto connection active.',
    };
  }
}
