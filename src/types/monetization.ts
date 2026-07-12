export interface ChapterUnlock {
  id: string;
  user_id: string;
  chapter_id: string;
  coins_spent: number;
  unlocked_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: 'read' | 'download' | 'like' | 'share' | 'unlock' | 'premium_feature';
  chapter_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DownloadLog {
  id: string;
  user_id?: string;
  chapter_id: string;
  download_type: 'chapter' | 'zip' | 'image';
  file_size?: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'spend' | 'refund' | 'reward';
  description: string;
  chapter_id?: string;
  created_at: string;
}

export interface UsageLimits {
  daily_downloads: number;
  monthly_downloads: number;
  daily_reads: number;
  requires_captcha_after: number;
}

export interface UserUsageStats {
  user_id: string;
  daily_downloads: number;
  monthly_downloads: number;
  daily_reads: number;
  last_download: string | null;
  last_read: string | null;
}