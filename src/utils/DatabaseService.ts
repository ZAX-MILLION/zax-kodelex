// Unified Database Service for Supabase and MySQL
import { supabase } from '@/integrations/supabase/client';
import { DatabaseFactory, MySQLConfig } from './MySQLAdapter';

export type DatabaseProvider = 'supabase' | 'mysql';

interface DatabaseConfig {
  provider: DatabaseProvider;
  mysql?: MySQLConfig;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private provider: DatabaseProvider = 'supabase';
  private config: DatabaseConfig;

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private loadConfig() {
    try {
      // Check environment variable first
      const envProvider = import.meta.env.VITE_DATABASE_PROVIDER as DatabaseProvider;
      if (envProvider && (envProvider === 'supabase' || envProvider === 'mysql')) {
        this.provider = envProvider;
      }

      // Load from localStorage as fallback
      const stored = localStorage.getItem('database_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = parsed;
        this.provider = parsed.provider || 'supabase';
      } else {
        this.config = { provider: this.provider };
      }

      // Configure database factory
      if (this.provider === 'mysql' && this.config.mysql) {
        DatabaseFactory.configure(true, this.config.mysql);
      } else {
        DatabaseFactory.configure(false);
      }
    } catch (error) {
      console.error('Failed to load database config:', error);
      this.config = { provider: 'supabase' };
    }
  }

  getProvider(): DatabaseProvider {
    return this.provider;
  }

  async switchProvider(provider: DatabaseProvider, mysqlConfig?: MySQLConfig) {
    this.provider = provider;
    this.config = { provider, mysql: mysqlConfig };
    
    localStorage.setItem('database_config', JSON.stringify(this.config));
    
    if (provider === 'mysql' && mysqlConfig) {
      DatabaseFactory.configure(true, mysqlConfig);
    } else {
      DatabaseFactory.configure(false);
    }
  }

  // Unified API methods
  async query(sql: string, params: any[] = []): Promise<any> {
    if (this.provider === 'mysql') {
      const adapter = DatabaseFactory.getAdapter();
      if (adapter) {
        return adapter.query(sql, params);
      }
      throw new Error('MySQL adapter not configured');
    } else {
      // Convert SQL to Supabase operations
      return this.executeSupabaseQuery(sql, params);
    }
  }

  private async executeSupabaseQuery(sql: string, params: any[]): Promise<any> {
    // Basic SQL to Supabase conversion
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('select') && lowerSql.includes('manga_meta')) {
      return await supabase.from('manga_meta').select('*');
    }
    if (lowerSql.includes('select') && lowerSql.includes('chapters')) {
      return await supabase.from('chapters').select('*');
    }
    if (lowerSql.includes('select') && lowerSql.includes('profiles')) {
      return await supabase.from('profiles').select('*');
    }
    
    console.warn('SQL query not supported in Supabase mode:', sql);
    return { data: [], error: null };
  }

  // High-level API methods that work with both databases
  async getMangaSeries(limit = 20, offset = 0) {
    if (this.provider === 'mysql') {
      return this.query(
        'SELECT * FROM manga_meta ORDER BY updated_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
    } else {
      return await supabase
        .from('manga_meta')
        .select('*')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }
  }

  async getChapters(seriesId: string) {
    if (this.provider === 'mysql') {
      return this.query(
        'SELECT * FROM chapters WHERE series_id = ? ORDER BY chapter_number ASC',
        [seriesId]
      );
    } else {
      return await supabase
        .from('chapters')
        .select('*')
        .eq('series_id', seriesId)
        .order('chapter_number', { ascending: true });
    }
  }

  async getUserProfile(userId: string) {
    if (this.provider === 'mysql') {
      return this.query('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    } else {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    }
  }

  async createComment(commentData: any) {
    if (this.provider === 'mysql') {
      const adapter = DatabaseFactory.getAdapter();
      if (adapter) {
        return adapter.insert('comments', commentData);
      }
      throw new Error('MySQL adapter not configured');
    } else {
      return await supabase.from('comments').insert(commentData);
    }
  }

  async updateReadingProgress(userId: string, chapterId: string, page: number) {
    if (this.provider === 'mysql') {
      return this.query(
        `INSERT INTO reading_progress (user_id, chapter_id, page_number, updated_at) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE page_number = ?, updated_at = ?`,
        [userId, chapterId, page, new Date().toISOString(), page, new Date().toISOString()]
      );
    } else {
      return await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          current_page: page,
          total_pages: 1, // Will be updated when we know the actual total
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,chapter_id' });
    }
  }

  async getCoinBalance(userId: string) {
    if (this.provider === 'mysql') {
      const result = await this.query(
        'SELECT balance FROM coin_wallets WHERE user_id = ?',
        [userId]
      );
      return result.data?.[0]?.balance || 0;
    } else {
      const { data } = await supabase
        .from('coin_wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
      return data?.balance || 0;
    }
  }

  async processCoins(userId: string, amount: number, type: 'earn' | 'spend', context: string) {
    if (this.provider === 'mysql') {
      // MySQL implementation
      await this.query('START TRANSACTION');
      try {
        await this.query(
          'INSERT INTO coin_transactions (user_id, amount, type, context, created_at) VALUES (?, ?, ?, ?, ?)',
          [userId, amount, type, context, new Date().toISOString()]
        );
        
        const balanceChange = type === 'earn' ? amount : -amount;
        await this.query(
          'UPDATE coin_wallets SET balance = balance + ? WHERE user_id = ?',
          [balanceChange, userId]
        );
        
        await this.query('COMMIT');
        return { success: true };
      } catch (error) {
        await this.query('ROLLBACK');
        throw error;
      }
    } else {
      // Use Supabase RPC function
      const { data, error } = await supabase.rpc('process_coin_transaction', {
        user_id_param: userId,
        amount_param: amount,
        type_param: type,
        context_param: context
      });
      return { success: !error, data, error };
    }
  }
}

export const db = DatabaseService.getInstance();