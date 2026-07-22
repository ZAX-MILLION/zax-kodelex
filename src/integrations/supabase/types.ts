export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ad_zones: {
        Row: {
          ad_code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          position: string
          priority: number | null
          size_specs: string | null
          updated_at: string | null
          zone_name: string
        }
        Insert: {
          ad_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position: string
          priority?: number | null
          size_specs?: string | null
          updated_at?: string | null
          zone_name: string
        }
        Update: {
          ad_code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: string
          priority?: number | null
          size_specs?: string | null
          updated_at?: string | null
          zone_name?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      analytics_aggregations: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          period_date: string
          period_type: string
          segment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          period_date: string
          period_type: string
          segment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          period_date?: string
          period_type?: string
          segment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_config: {
        Row: {
          config_data: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          tracking_id: string | null
          updated_at: string | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          tracking_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          tracking_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon_url: string | null
          id: string
          is_animated: boolean
          is_hidden: boolean
          is_premium: boolean
          name: string
          rarity: string | null
          requirements: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_animated?: boolean
          is_hidden?: boolean
          is_premium?: boolean
          name: string
          rarity?: string | null
          requirements?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_animated?: boolean
          is_hidden?: boolean
          is_premium?: boolean
          name?: string
          rarity?: string | null
          requirements?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          note: string | null
          page_number: number
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          note?: string | null
          page_number: number
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          note?: string | null
          page_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_uploads: {
        Row: {
          created_at: string | null
          file_count: number | null
          id: string
          metadata: Json | null
          processed_count: number | null
          series_id: string
          status: string | null
          updated_at: string | null
          upload_type: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_count?: number | null
          id?: string
          metadata?: Json | null
          processed_count?: number | null
          series_id: string
          status?: string | null
          updated_at?: string | null
          upload_type: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_count?: number | null
          id?: string
          metadata?: Json | null
          processed_count?: number | null
          series_id?: string
          status?: string | null
          updated_at?: string | null
          upload_type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_uploads_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_access: {
        Row: {
          access_type: string
          chapter_id: string
          coins_spent: number | null
          granted_at: string
          granted_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          access_type: string
          chapter_id: string
          coins_spent?: number | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          access_type?: string
          chapter_id?: string
          coins_spent?: number | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_access_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapter_prices: {
        Row: {
          chapter_id: string
          coin_cost: number
          created_at: string
          early_access_hours: number | null
          id: string
          premium_only: boolean
          updated_at: string
        }
        Insert: {
          chapter_id: string
          coin_cost?: number
          created_at?: string
          early_access_hours?: number | null
          id?: string
          premium_only?: boolean
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          coin_cost?: number
          created_at?: string
          early_access_hours?: number | null
          id?: string
          premium_only?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_prices_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: true
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          download_count: number | null
          id: string
          is_locked: boolean
          page_count: number
          pages: Json
          release_date: string
          seo_description: string | null
          seo_title: string | null
          series_id: string | null
          sort_order: number
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          chapter_number: number
          created_at?: string
          download_count?: number | null
          id?: string
          is_locked?: boolean
          page_count?: number
          pages?: Json
          release_date?: string
          seo_description?: string | null
          seo_title?: string | null
          series_id?: string | null
          sort_order: number
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          chapter_number?: number
          created_at?: string
          download_count?: number | null
          id?: string
          is_locked?: boolean
          page_count?: number
          pages?: Json
          release_date?: string
          seo_description?: string | null
          seo_title?: string | null
          series_id?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      child_themes: {
        Row: {
          author: string | null
          created_at: string
          custom_css: string | null
          description: string | null
          display_name: string
          homepage_component: string | null
          id: string
          is_active: boolean
          is_default: boolean
          layout_overrides: Json | null
          name: string
          preview_image_url: string | null
          theme_config: Json
          updated_at: string
          version: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          display_name: string
          homepage_component?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_overrides?: Json | null
          name: string
          preview_image_url?: string | null
          theme_config?: Json
          updated_at?: string
          version?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          display_name?: string
          homepage_component?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_overrides?: Json | null
          name?: string
          preview_image_url?: string | null
          theme_config?: Json
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          admin_user_id: string | null
          amount: number
          context: string
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          admin_user_id?: string | null
          amount: number
          context: string
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          admin_user_id?: string | null
          amount?: number
          context?: string
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      coin_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          chapter_id: string
          content: string
          created_at: string
          edit_deadline: string | null
          flag_count: number | null
          id: string
          is_edited: boolean | null
          is_flagged: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          markdown_content: string | null
          parent_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          content: string
          created_at?: string
          edit_deadline?: string | null
          flag_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          markdown_content?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          content?: string
          created_at?: string
          edit_deadline?: string | null
          flag_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          markdown_content?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_settings: {
        Row: {
          auto_flag_threshold: number | null
          blacklisted_words: string[] | null
          created_at: string | null
          edit_window_minutes: number | null
          enable_markdown: boolean | null
          enable_threaded_comments: boolean | null
          id: string
          max_comment_length: number | null
          rate_limit_comments_per_minute: number | null
          spam_detection_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_flag_threshold?: number | null
          blacklisted_words?: string[] | null
          created_at?: string | null
          edit_window_minutes?: number | null
          enable_markdown?: boolean | null
          enable_threaded_comments?: boolean | null
          id?: string
          max_comment_length?: number | null
          rate_limit_comments_per_minute?: number | null
          spam_detection_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_flag_threshold?: number | null
          blacklisted_words?: string[] | null
          created_at?: string | null
          edit_window_minutes?: number | null
          enable_markdown?: boolean | null
          enable_threaded_comments?: boolean | null
          id?: string
          max_comment_length?: number | null
          rate_limit_comments_per_minute?: number | null
          spam_detection_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contest_entries: {
        Row: {
          contest_id: string
          entry_data: Json | null
          id: string
          is_winner: boolean | null
          reward_claimed: boolean | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          contest_id: string
          entry_data?: Json | null
          id?: string
          is_winner?: boolean | null
          reward_claimed?: boolean | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          contest_id?: string
          entry_data?: Json | null
          id?: string
          is_winner?: boolean | null
          reward_claimed?: boolean | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          auto_select_winners: boolean | null
          coin_reward: number | null
          created_at: string
          created_by: string
          description: string
          end_date: string
          entry_requirements: Json | null
          id: string
          max_winners: number | null
          premium_days: number | null
          reward_type: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          auto_select_winners?: boolean | null
          coin_reward?: number | null
          created_at?: string
          created_by: string
          description: string
          end_date: string
          entry_requirements?: Json | null
          id?: string
          max_winners?: number | null
          premium_days?: number | null
          reward_type: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          auto_select_winners?: boolean | null
          coin_reward?: number | null
          created_at?: string
          created_by?: string
          description?: string
          end_date?: string
          entry_requirements?: Json | null
          id?: string
          max_winners?: number | null
          premium_days?: number | null
          reward_type?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          email: string
          id: string
          message: string | null
          paypal_order_data: Json | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          email: string
          id?: string
          message?: string | null
          paypal_order_data?: Json | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          paypal_order_data?: Json | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      download_logs: {
        Row: {
          created_at: string
          customer_id: string
          download_url: string | null
          file_size: number | null
          id: string
          ip_address: unknown | null
          license_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          download_url?: string | null
          file_size?: number | null
          id?: string
          ip_address?: unknown | null
          license_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          download_url?: string | null
          file_size?: number | null
          id?: string
          ip_address?: unknown | null
          license_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      duplicate_detection: {
        Row: {
          created_at: string
          detection_method: string
          duplicate_upload_id: string
          id: string
          original_upload_id: string
          resolved_at: string | null
          resolved_by: string | null
          similarity_score: number | null
          status: string
        }
        Insert: {
          created_at?: string
          detection_method: string
          duplicate_upload_id: string
          id?: string
          original_upload_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number | null
          status?: string
        }
        Update: {
          created_at?: string
          detection_method?: string
          duplicate_upload_id?: string
          id?: string
          original_upload_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          similarity_score?: number | null
          status?: string
        }
        Relationships: []
      }
      envato_purchases: {
        Row: {
          associated_email: string
          buyer_username: string | null
          created_at: string
          id: string
          item_id: string | null
          item_name: string | null
          last_validation_at: string | null
          license_type: string | null
          purchase_code: string
          purchase_date: string | null
          status: string
          support_amount: number | null
          support_until: string | null
          updated_at: string
          validated_at: string
          validated_domain: string
          validation_count: number | null
        }
        Insert: {
          associated_email: string
          buyer_username?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string | null
          last_validation_at?: string | null
          license_type?: string | null
          purchase_code: string
          purchase_date?: string | null
          status?: string
          support_amount?: number | null
          support_until?: string | null
          updated_at?: string
          validated_at?: string
          validated_domain: string
          validation_count?: number | null
        }
        Update: {
          associated_email?: string
          buyer_username?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string | null
          last_validation_at?: string | null
          license_type?: string | null
          purchase_code?: string
          purchase_date?: string | null
          status?: string
          support_amount?: number | null
          support_until?: string | null
          updated_at?: string
          validated_at?: string
          validated_domain?: string
          validation_count?: number | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          allowed_roles: string[] | null
          created_at: string
          description: string | null
          display_name: string
          flag_key: string
          id: string
          is_enabled: boolean
          last_toggled_at: string | null
          last_toggled_by: string | null
          updated_at: string
          usage_count: number | null
          visibility: string
        }
        Insert: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          display_name: string
          flag_key: string
          id?: string
          is_enabled?: boolean
          last_toggled_at?: string | null
          last_toggled_by?: string | null
          updated_at?: string
          usage_count?: number | null
          visibility?: string
        }
        Update: {
          allowed_roles?: string[] | null
          created_at?: string
          description?: string | null
          display_name?: string
          flag_key?: string
          id?: string
          is_enabled?: boolean
          last_toggled_at?: string | null
          last_toggled_by?: string | null
          updated_at?: string
          usage_count?: number | null
          visibility?: string
        }
        Relationships: []
      }
      feature_toggles: {
        Row: {
          config_data: Json | null
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      global_notifications: {
        Row: {
          created_at: string
          expire_at: string | null
          id: string
          is_active: boolean
          message: string
          show_on_all_pages: boolean
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expire_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          show_on_all_pages?: boolean
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expire_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          show_on_all_pages?: boolean
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_content: {
        Row: {
          category: string
          content: string
          content_type: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          order_index: number | null
          role_target: Database["public"]["Enums"]["user_role"]
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          role_target: Database["public"]["Enums"]["user_role"]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          content_type?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          order_index?: number | null
          role_target?: Database["public"]["Enums"]["user_role"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_settings: {
        Row: {
          auto_slide_interval: number
          blog_posts_count: number
          created_at: string
          enable_filter_tooltips: boolean | null
          feed_chapters_count: number
          filter_method: string | null
          hero_slides_count: number
          id: string
          latest_comics_count: number
          show_content_type_filter: boolean
          slider_series_count_lg: number | null
          slider_series_count_md: number | null
          slider_series_count_sm: number | null
          slider_series_count_xl: number | null
          trending_count: number
          updated_at: string
        }
        Insert: {
          auto_slide_interval?: number
          blog_posts_count?: number
          created_at?: string
          enable_filter_tooltips?: boolean | null
          feed_chapters_count?: number
          filter_method?: string | null
          hero_slides_count?: number
          id?: string
          latest_comics_count?: number
          show_content_type_filter?: boolean
          slider_series_count_lg?: number | null
          slider_series_count_md?: number | null
          slider_series_count_sm?: number | null
          slider_series_count_xl?: number | null
          trending_count?: number
          updated_at?: string
        }
        Update: {
          auto_slide_interval?: number
          blog_posts_count?: number
          created_at?: string
          enable_filter_tooltips?: boolean | null
          feed_chapters_count?: number
          filter_method?: string | null
          hero_slides_count?: number
          id?: string
          latest_comics_count?: number
          show_content_type_filter?: boolean
          slider_series_count_lg?: number | null
          slider_series_count_md?: number | null
          slider_series_count_sm?: number | null
          slider_series_count_xl?: number | null
          trending_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_widgets: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_enabled: boolean
          settings: Json
          updated_at: string
          widget_name: string
          widget_type: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          settings?: Json
          updated_at?: string
          widget_name: string
          widget_type: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_enabled?: boolean
          settings?: Json
          updated_at?: string
          widget_name?: string
          widget_type?: string
        }
        Relationships: []
      }
      install_status: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          installed_at: string | null
          installed_by: string | null
          is_installed: boolean
          license_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          installed_at?: string | null
          installed_by?: string | null
          is_installed?: boolean
          license_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          installed_at?: string | null
          installed_by?: string | null
          is_installed?: boolean
          license_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string
          direction: string
          display_order: number
          font_family: string | null
          id: string
          is_active: boolean
          name: string
          native_name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          direction?: string
          display_order?: number
          font_family?: string | null
          id?: string
          is_active?: boolean
          name: string
          native_name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          direction?: string
          display_order?: number
          font_family?: string | null
          id?: string
          is_active?: boolean
          name?: string
          native_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      license_verifications: {
        Row: {
          created_at: string
          domain: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          license_key: string
          user_agent: string | null
          verification_result: boolean
        }
        Insert: {
          created_at?: string
          domain: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          license_key: string
          user_agent?: string | null
          verification_result: boolean
        }
        Update: {
          created_at?: string
          domain?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          license_key?: string
          user_agent?: string | null
          verification_result?: boolean
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          customer_id: string
          domains_allowed: number
          domains_used: string[] | null
          expires_at: string | null
          id: string
          is_active: boolean
          license_key: string
          license_type: Database["public"]["Enums"]["license_type"]
          product_name: string
          product_version: string
          purchase_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          domains_allowed?: number
          domains_used?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_key: string
          license_type?: Database["public"]["Enums"]["license_type"]
          product_name?: string
          product_version?: string
          purchase_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          domains_allowed?: number
          domains_used?: string[] | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_key?: string
          license_type?: Database["public"]["Enums"]["license_type"]
          product_name?: string
          product_version?: string
          purchase_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_licenses_purchase_id"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_meta: {
        Row: {
          age_rating: string | null
          alt_names: string[] | null
          appearance_override: string | null
          artist: string | null
          author: string | null
          content_type: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          details_background_url: string | null
          details_bg_accent_color: string | null
          details_bg_attachment: string | null
          details_bg_blur: number | null
          details_bg_overlay_darkness: number | null
          details_bg_position: string | null
          details_layout_override: string | null
          genres: string[] | null
          id: string
          language: string | null
          linked_series_id: string | null
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          noindex: boolean
          publication_date: string | null
          rating_average: number | null
          rating_count: number | null
          status: Database["public"]["Enums"]["manga_status"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          age_rating?: string | null
          alt_names?: string[] | null
          appearance_override?: string | null
          artist?: string | null
          author?: string | null
          content_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          details_background_url?: string | null
          details_bg_accent_color?: string | null
          details_bg_attachment?: string | null
          details_bg_blur?: number | null
          details_bg_overlay_darkness?: number | null
          details_bg_position?: string | null
          details_layout_override?: string | null
          genres?: string[] | null
          id?: string
          language?: string | null
          linked_series_id?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          noindex?: boolean
          publication_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          status?: Database["public"]["Enums"]["manga_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          age_rating?: string | null
          alt_names?: string[] | null
          appearance_override?: string | null
          artist?: string | null
          author?: string | null
          content_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          details_background_url?: string | null
          details_bg_accent_color?: string | null
          details_bg_attachment?: string | null
          details_bg_blur?: number | null
          details_bg_overlay_darkness?: number | null
          details_bg_position?: string | null
          details_layout_override?: string | null
          genres?: string[] | null
          id?: string
          language?: string | null
          linked_series_id?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          noindex?: boolean
          publication_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          status?: Database["public"]["Enums"]["manga_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manga_meta_linked_series_id_fkey"
            columns: ["linked_series_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      manga_ratings: {
        Row: {
          created_at: string | null
          id: string
          manga_id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          manga_id: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          manga_id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manga_ratings_manga_id_fkey"
            columns: ["manga_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          moderator_id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          moderator_id: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          moderator_id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          paypal_data: Json | null
          paypal_transaction_id: string | null
          processed_at: string | null
          status: string
          subscription_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          paypal_data?: Json | null
          paypal_transaction_id?: string | null
          processed_at?: string | null
          status: string
          subscription_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          paypal_data?: Json | null
          paypal_transaction_id?: string | null
          processed_at?: string | null
          status?: string
          subscription_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_themes: {
        Row: {
          available_from: string | null
          available_until: string | null
          coin_cost: number | null
          created_at: string
          css_variables: Json | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          is_seasonal: boolean | null
          preview_image_url: string | null
          theme_description: string | null
          theme_id: string
          theme_name: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          coin_cost?: number | null
          created_at?: string
          css_variables?: Json | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_seasonal?: boolean | null
          preview_image_url?: string | null
          theme_description?: string | null
          theme_id: string
          theme_name: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          coin_cost?: number | null
          created_at?: string
          css_variables?: Json | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          is_seasonal?: boolean | null
          preview_image_url?: string | null
          theme_description?: string | null
          theme_id?: string
          theme_name?: string
        }
        Relationships: []
      }
      profile_visits: {
        Row: {
          id: string
          profile_user_id: string
          visited_at: string
          visitor_ip: unknown | null
          visitor_user_id: string | null
        }
        Insert: {
          id?: string
          profile_user_id: string
          visited_at?: string
          visitor_ip?: unknown | null
          visitor_user_id?: string | null
        }
        Update: {
          id?: string
          profile_user_id?: string
          visited_at?: string
          visitor_ip?: unknown | null
          visitor_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_score: number | null
          banner_image_url: string | null
          bio: string | null
          chapter_layout_preference: number | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_banned: boolean
          is_profile_public: boolean | null
          join_date: string | null
          last_login_at: string | null
          login_count: number | null
          premium_effects_enabled: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json | null
          theme_preference: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          activity_score?: number | null
          banner_image_url?: string | null
          bio?: string | null
          chapter_layout_preference?: number | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          is_banned?: boolean
          is_profile_public?: boolean | null
          join_date?: string | null
          last_login_at?: string | null
          login_count?: number | null
          premium_effects_enabled?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          activity_score?: number | null
          banner_image_url?: string | null
          bio?: string | null
          chapter_layout_preference?: number | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_banned?: boolean
          is_profile_public?: boolean | null
          join_date?: string | null
          last_login_at?: string | null
          login_count?: number | null
          premium_effects_enabled?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          id: string
          invoice_number: string | null
          license_id: string | null
          metadata: Json | null
          notes: string | null
          payment_intent_id: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          invoice_number?: string | null
          license_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          invoice_number?: string | null
          license_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          chapter_id: string
          completed: boolean
          created_at: string
          current_page: number
          id: string
          last_read_at: string
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          completed?: boolean
          created_at?: string
          current_page?: number
          id?: string
          last_read_at?: string
          total_pages: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          completed?: boolean
          created_at?: string
          current_page?: number
          id?: string
          last_read_at?: string
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          target_id: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_dashboards: {
        Row: {
          created_at: string | null
          dashboard_config: Json
          id: string
          menu_items: Json
          permissions: Json
          role_name: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dashboard_config?: Json
          id?: string
          menu_items?: Json
          permissions?: Json
          role_name: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dashboard_config?: Json
          id?: string
          menu_items?: Json
          permissions?: Json
          role_name?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_type: string
          robots_directives: string | null
          structured_data: Json | null
          target_id: string | null
          updated_at: string | null
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_type: string
          robots_directives?: string | null
          structured_data?: Json | null
          target_id?: string | null
          updated_at?: string | null
        }
        Update: {
          canonical_url?: string | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_type?: string
          robots_directives?: string | null
          structured_data?: Json | null
          target_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      series_comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "series_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      series_comments: {
        Row: {
          content: string
          created_at: string
          edit_deadline: string | null
          flag_count: number | null
          id: string
          is_edited: boolean | null
          is_flagged: boolean | null
          is_pinned: boolean | null
          like_count: number | null
          markdown_content: string | null
          parent_id: string | null
          series_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          edit_deadline?: string | null
          flag_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          markdown_content?: string | null
          parent_id?: string | null
          series_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          edit_deadline?: string | null
          flag_count?: number | null
          id?: string
          is_edited?: boolean | null
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          like_count?: number | null
          markdown_content?: string | null
          parent_id?: string | null
          series_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "series_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_comments_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      series_covers: {
        Row: {
          cover_url: string
          created_at: string | null
          dimensions: Json | null
          file_size: number | null
          id: string
          is_active: boolean | null
          series_id: string
          thumbnail_url: string | null
          uploaded_by: string | null
        }
        Insert: {
          cover_url: string
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          series_id: string
          thumbnail_url?: string | null
          uploaded_by?: string | null
        }
        Update: {
          cover_url?: string
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          series_id?: string
          thumbnail_url?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_covers_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "manga_meta"
            referencedColumns: ["id"]
          },
        ]
      }
      series_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          referrer: string | null
          series_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          series_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          series_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          analytics_code: string | null
          button_style: string | null
          created_at: string
          cursor_glow: boolean | null
          cursor_size: number | null
          cursor_trail: boolean | null
          cursor_type: string | null
          custom_css: string | null
          custom_cursor_url: string | null
          custom_js: string | null
          enable_animations: boolean | null
          font_size: string | null
          hero_bg_url: string | null
          hero_height: string | null
          id: string
          layout_mode: string | null
          logo_url: string | null
          maintenance_message: string | null
          maintenance_mode: boolean
          secondary_color: string | null
          site_title: string
          theme_color: string
          typography_style: string | null
          updated_at: string
        }
        Insert: {
          analytics_code?: string | null
          button_style?: string | null
          created_at?: string
          cursor_glow?: boolean | null
          cursor_size?: number | null
          cursor_trail?: boolean | null
          cursor_type?: string | null
          custom_css?: string | null
          custom_cursor_url?: string | null
          custom_js?: string | null
          enable_animations?: boolean | null
          font_size?: string | null
          hero_bg_url?: string | null
          hero_height?: string | null
          id?: string
          layout_mode?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          secondary_color?: string | null
          site_title?: string
          theme_color?: string
          typography_style?: string | null
          updated_at?: string
        }
        Update: {
          analytics_code?: string | null
          button_style?: string | null
          created_at?: string
          cursor_glow?: boolean | null
          cursor_size?: number | null
          cursor_trail?: boolean | null
          cursor_type?: string | null
          custom_css?: string | null
          custom_cursor_url?: string | null
          custom_js?: string | null
          enable_animations?: boolean | null
          font_size?: string | null
          hero_bg_url?: string | null
          hero_height?: string | null
          id?: string
          layout_mode?: string | null
          logo_url?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean
          secondary_color?: string | null
          site_title?: string
          theme_color?: string
          typography_style?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_media_settings: {
        Row: {
          created_at: string
          custom_icon_url: string | null
          display_order: number
          icon_type: string
          id: string
          is_enabled: boolean
          platform_color: string | null
          platform_name: string
          platform_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_icon_url?: string | null
          display_order?: number
          icon_type?: string
          id?: string
          is_enabled?: boolean
          platform_color?: string | null
          platform_name: string
          platform_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_icon_url?: string | null
          display_order?: number
          icon_type?: string
          id?: string
          is_enabled?: boolean
          platform_color?: string | null
          platform_name?: string
          platform_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_changelog: {
        Row: {
          change_type: string
          created_at: string
          created_by: string
          description: string
          developer_notes: string | null
          id: string
          is_published: boolean
          release_date: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          change_type?: string
          created_at?: string
          created_by: string
          description: string
          developer_notes?: string | null
          id?: string
          is_published?: boolean
          release_date?: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          change_type?: string
          created_at?: string
          created_by?: string
          description?: string
          developer_notes?: string | null
          id?: string
          is_published?: boolean
          release_date?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string
          message: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      theme_cache: {
        Row: {
          cache_key: string
          cached_data: Json
          created_at: string
          expires_at: string
          id: string
          theme_id: string
        }
        Insert: {
          cache_key: string
          cached_data: Json
          created_at?: string
          expires_at: string
          id?: string
          theme_id: string
        }
        Update: {
          cache_key?: string
          cached_data?: Json
          created_at?: string
          expires_at?: string
          id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_cache_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "theme_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_changelog: {
        Row: {
          changes: string
          created_at: string
          created_by: string | null
          id: string
          theme_id: string
          version: string
        }
        Insert: {
          changes: string
          created_at?: string
          created_by?: string | null
          id?: string
          theme_id: string
          version: string
        }
        Update: {
          changes?: string
          created_at?: string
          created_by?: string | null
          id?: string
          theme_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_changelog_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "child_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_metadata: {
        Row: {
          applied_at: string | null
          backup_data: Json
          breaking_changes: string[] | null
          changelog: string | null
          created_at: string
          created_by: string | null
          id: string
          is_major_update: boolean | null
          rollback_to_version: string | null
          status: string
          theme_id: string
          version: string
        }
        Insert: {
          applied_at?: string | null
          backup_data: Json
          breaking_changes?: string[] | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_major_update?: boolean | null
          rollback_to_version?: string | null
          status?: string
          theme_id: string
          version: string
        }
        Update: {
          applied_at?: string | null
          backup_data?: Json
          breaking_changes?: string[] | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_major_update?: boolean | null
          rollback_to_version?: string | null
          status?: string
          theme_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_metadata_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "theme_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          author: string | null
          category: string | null
          color_settings: Json
          component_overrides: Json | null
          created_at: string
          custom_css: string | null
          custom_js: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          is_default: boolean
          layout_settings: Json
          license_type: string | null
          preview_image_url: string | null
          slider_settings: Json
          tags: string[] | null
          theme_name: string
          typography_settings: Json | null
          updated_at: string
          version: string
          widget_settings: Json
        }
        Insert: {
          author?: string | null
          category?: string | null
          color_settings?: Json
          component_overrides?: Json | null
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_settings?: Json
          license_type?: string | null
          preview_image_url?: string | null
          slider_settings?: Json
          tags?: string[] | null
          theme_name: string
          typography_settings?: Json | null
          updated_at?: string
          version?: string
          widget_settings?: Json
        }
        Update: {
          author?: string | null
          category?: string | null
          color_settings?: Json
          component_overrides?: Json | null
          created_at?: string
          custom_css?: string | null
          custom_js?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_settings?: Json
          license_type?: string | null
          preview_image_url?: string | null
          slider_settings?: Json
          tags?: string[] | null
          theme_name?: string
          typography_settings?: Json | null
          updated_at?: string
          version?: string
          widget_settings?: Json
        }
        Relationships: []
      }
      themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          context: string | null
          created_at: string
          id: string
          key: string
          language_code: string
          updated_at: string
          value: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          key: string
          language_code: string
          updated_at?: string
          value: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          key?: string
          language_code?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      upload_metadata: {
        Row: {
          associated_chapter_id: string | null
          associated_manga_id: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          hash_value: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          mime_type: string | null
          updated_at: string
          upload_context: string | null
          uploader_id: string
        }
        Insert: {
          associated_chapter_id?: string | null
          associated_manga_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          hash_value?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          mime_type?: string | null
          updated_at?: string
          upload_context?: string | null
          uploader_id: string
        }
        Update: {
          associated_chapter_id?: string | null
          associated_manga_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          hash_value?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          mime_type?: string | null
          updated_at?: string
          upload_context?: string | null
          uploader_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          chapter_id: string | null
          content_id: string | null
          content_type: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          chapter_id?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          chapter_id?: string | null
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_badge_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          badge_id: string
          display_order: number | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_equipped: boolean | null
          new_badge_id: string | null
          notes: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          badge_id: string
          display_order?: number | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_equipped?: boolean | null
          new_badge_id?: string | null
          notes?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          badge_id?: string
          display_order?: number | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_equipped?: boolean | null
          new_badge_id?: string | null
          notes?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badge_assignments_new_badge_id_fkey"
            columns: ["new_badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_color: string | null
          badge_description: string | null
          badge_icon_url: string | null
          badge_id: string
          badge_name: string
          badge_rarity: string | null
          coin_cost: number | null
          created_at: string
          id: string
          is_animated: boolean | null
          is_premium: boolean | null
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          badge_description?: string | null
          badge_icon_url?: string | null
          badge_id: string
          badge_name: string
          badge_rarity?: string | null
          coin_cost?: number | null
          created_at?: string
          id?: string
          is_animated?: boolean | null
          is_premium?: boolean | null
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          badge_description?: string | null
          badge_icon_url?: string | null
          badge_id?: string
          badge_name?: string
          badge_rarity?: string | null
          coin_cost?: number | null
          created_at?: string
          id?: string
          is_animated?: boolean | null
          is_premium?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          created_at: string
          expires_at: string | null
          flag_key: string
          granted_by: string | null
          id: string
          is_enabled: boolean
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          flag_key: string
          granted_by?: string | null
          id?: string
          is_enabled: boolean
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          flag_key?: string
          granted_by?: string | null
          id?: string
          is_enabled?: boolean
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_language_preferences: {
        Row: {
          created_at: string
          id: string
          language_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          created_at: string
          id: string
          is_private: boolean | null
          note_author_id: string
          note_content: string
          note_type: string | null
          target_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_author_id: string
          note_content: string
          note_type?: string | null
          target_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_private?: boolean | null
          note_author_id?: string
          note_content?: string
          note_type?: string | null
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_preferences: {
        Row: {
          analytics_opt_out: boolean
          created_at: string
          id: string
          marketing_opt_out: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_opt_out?: boolean
          created_at?: string
          id?: string
          marketing_opt_out?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_opt_out?: boolean
          created_at?: string
          id?: string
          marketing_opt_out?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reading_preferences: {
        Row: {
          auto_progress: boolean | null
          chapter_sort_order: string | null
          created_at: string | null
          id: string
          reading_mode: string | null
          show_locked_chapters: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_progress?: boolean | null
          chapter_sort_order?: string | null
          created_at?: string | null
          id?: string
          reading_mode?: string | null
          show_locked_chapters?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_progress?: boolean | null
          chapter_sort_order?: string | null
          created_at?: string | null
          id?: string
          reading_mode?: string | null
          show_locked_chapters?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          role: Database["public"]["Enums"]["user_role_type"]
          source: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          role?: Database["public"]["Enums"]["user_role_type"]
          source?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          role?: Database["public"]["Enums"]["user_role_type"]
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          auto_renew: boolean
          created_at: string
          currency: string | null
          end_date: string | null
          id: string
          metadata: Json | null
          paypal_plan_id: string | null
          paypal_subscription_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          paypal_plan_id?: string | null
          paypal_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          metadata?: Json | null
          paypal_plan_id?: string | null
          paypal_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_theme_preferences: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          theme_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          theme_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          theme_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_theme_preferences_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "child_themes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_upload_hash: {
        Args: { file_path: string; file_size: number }
        Returns: string
      }
      contains_placeholder_content: {
        Args: { content_text: string }
        Returns: boolean
      }
      create_coin_wallet: {
        Args: { user_id_param: string }
        Returns: string
      }
      generate_license_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_theme_cached: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_daily_active_users: {
        Args: { target_date?: string }
        Returns: number
      }
      get_envato_purchase_for_domain: {
        Args: { domain_name: string }
        Returns: {
          purchase_code: string
          validated_at: string
          associated_email: string
          item_name: string
          license_type: string
        }[]
      }
      get_latest_chapters_feed: {
        Args: { days_back?: number; limit_count?: number }
        Returns: {
          chapter_id: string
          chapter_title: string
          chapter_number: number
          series_id: string
          series_title: string
          cover_image_url: string
          created_at: string
        }[]
      }
      get_latest_chapters_feed_all: {
        Args: { days_back?: number; limit_count?: number }
        Returns: {
          chapter_id: string
          chapter_title: string
          chapter_number: number
          series_id: string
          series_title: string
          cover_image_url: string
          created_at: string
          is_locked: boolean
          unlock_cost: number
        }[]
      }
      get_monthly_active_users: {
        Args: { target_month?: string }
        Returns: number
      }
      get_monthly_recurring_revenue: {
        Args: { target_month?: string }
        Returns: number
      }
      get_popular_content: {
        Args: { content_type_filter?: string; limit_count?: number }
        Returns: {
          content_id: string
          content_type: string
          view_count: number
          unique_users: number
        }[]
      }
      get_series_chapter_listings: {
        Args: { series_id_param: string }
        Returns: {
          id: string
          title: string
          chapter_number: number
          page_count: number
          release_date: string
          view_count: number
          is_locked: boolean
          thumbnail_url: string
          unlock_cost: number
        }[]
      }
      get_translation: {
        Args: { translation_key: string; lang_code?: string }
        Returns: string
      }
      get_trending_series: {
        Args: { days_back?: number; limit_count?: number }
        Returns: {
          series_id: string
          view_count: number
          unique_viewers: number
        }[]
      }
      get_user_coin_balance: {
        Args: { user_id_param?: string }
        Returns: number
      }
      get_user_profile_data: {
        Args: { target_user_id: string }
        Returns: Json
      }
      grant_badge_to_user: {
        Args: {
          target_user_id: string
          target_badge_id: string
          granter_id?: string
          admin_notes?: string
        }
        Returns: boolean
      }
      has_feature_flag: {
        Args: { flag_key_param: string; user_id_param?: string }
        Returns: boolean
      }
      has_valid_envato_purchase: {
        Args: { domain_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_premium_user: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_user_banned: {
        Args: { user_id?: string }
        Returns: boolean
      }
      process_coin_transaction: {
        Args: {
          user_id_param: string
          amount_param: number
          type_param: string
          context_param: string
          reference_id_param?: string
          description_param?: string
          admin_user_id_param?: string
        }
        Returns: boolean
      }
      record_profile_visit: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      revoke_badge_from_user: {
        Args: { target_user_id: string; target_badge_id: string }
        Returns: boolean
      }
      run_scheduled_deduplication: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      switch_active_theme: {
        Args: { new_theme_id: string }
        Returns: undefined
      }
      unlock_chapter_with_coins: {
        Args: { chapter_id_param: string; user_id_param?: string }
        Returns: boolean
      }
      user_analytics_opt_out: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      user_has_chapter_access: {
        Args: { chapter_id_param: string; user_id_param?: string }
        Returns: boolean
      }
    }
    Enums: {
      license_type: "single" | "extended" | "developer"
      manga_status: "ongoing" | "completed" | "hiatus" | "cancelled"
      purchase_status: "pending" | "completed" | "failed" | "refunded"
      subscription_plan: "free" | "premium"
      subscription_status: "active" | "canceled" | "expired" | "pending"
      user_role:
        | "admin"
        | "user"
        | "editor"
        | "author"
        | "member"
        | "uploader"
        | "seo_manager"
      user_role_type:
        | "free"
        | "premium"
        | "vip"
        | "moderator"
        | "admin"
        | "seo_access"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      license_type: ["single", "extended", "developer"],
      manga_status: ["ongoing", "completed", "hiatus", "cancelled"],
      purchase_status: ["pending", "completed", "failed", "refunded"],
      subscription_plan: ["free", "premium"],
      subscription_status: ["active", "canceled", "expired", "pending"],
      user_role: [
        "admin",
        "user",
        "editor",
        "author",
        "member",
        "uploader",
        "seo_manager",
      ],
      user_role_type: [
        "free",
        "premium",
        "vip",
        "moderator",
        "admin",
        "seo_access",
      ],
    },
  },
} as const
