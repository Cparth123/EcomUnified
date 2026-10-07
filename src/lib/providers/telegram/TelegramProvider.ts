import { TelegramPost, ChannelType } from '@/types/supplierSearch';

export interface TelegramChannelInfo {
  username: string;
  title: string;
  channelId?: string;
  type: ChannelType;
  memberCount?: number;
  accessible: boolean;
  statusMessage?: string;
}

export interface TelegramProvider {
  /**
   * Searches posts in a specific Telegram channel/group for matching queries.
   */
  searchChannelPosts(
    channelUsername: string,
    query: string,
    limit?: number
  ): Promise<TelegramPost[]>;

  /**
   * Searches across configured public Telegram channels.
   */
  searchPublicPosts(
    query: string,
    limit?: number
  ): Promise<TelegramPost[]>;

  /**
   * Retrieves latest posts from a specific channel.
   */
  getChannelPosts(
    channelUsername: string,
    limit?: number
  ): Promise<TelegramPost[]>;

  /**
   * Checks channel accessibility and metadata.
   */
  getChannelInfo(channelUsername: string): Promise<TelegramChannelInfo>;
}
