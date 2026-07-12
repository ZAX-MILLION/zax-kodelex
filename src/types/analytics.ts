export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id: string;
  event_type: 'page_view' | 'chapter_read' | 'download' | 'login' | 'logout' | 'coin_spend' | 'subscription' | 'search' | 'scroll_depth';
  page_path: string;
  chapter_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AnalyticsDailySummary {
  id: string;
  date: string;
  total_page_views: number;
  total_chapter_reads: number;
  total_downloads: number;
  unique_users: number;
  unique_ips: number;
  total_coin_spent: number;
  new_subscriptions: number;
  bounce_rate: number;
  avg_session_duration: number;
  created_at: string;
}

export interface AbuseFlag {
  id: string;
  user_id?: string;
  ip_address?: string;
  flag_type: 'excessive_downloads' | 'suspicious_coins' | 'multiple_accounts' | 'payment_fraud' | 'spam_activity' | 'manual_report';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: Record<string, any>;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  flagged_by?: string; // admin user_id who flagged manually
  resolved_by?: string;
  resolution_note?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action_type: 'user_ban' | 'user_unban' | 'coin_grant' | 'subscription_modify' | 'flag_resolve' | 'config_change' | 'content_moderate';
  target_user_id?: string;
  target_entity_id?: string;
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface UserActivitySummary {
  user_id: string;
  email: string;
  username?: string;
  total_reads: number;
  total_downloads: number;
  coins_spent: number;
  subscription_status: 'free' | 'premium';
  last_activity: string;
  suspicious_flags: number;
  account_status: 'active' | 'suspended' | 'banned';
  signup_date: string;
}