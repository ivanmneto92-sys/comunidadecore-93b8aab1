export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_metrics: {
        Row: {
          account_balance: number | null
          created_at: string | null
          date: string
          day_return: number | null
          deposits_1m: number | null
          id: string
          max_drawdown: number | null
          month_return: number | null
          quarter_return: number | null
          total_profit: number | null
          total_return: number | null
          updated_at: string | null
          week_return: number | null
          withdrawals_1m: number | null
        }
        Insert: {
          account_balance?: number | null
          created_at?: string | null
          date?: string
          day_return?: number | null
          deposits_1m?: number | null
          id?: string
          max_drawdown?: number | null
          month_return?: number | null
          quarter_return?: number | null
          total_profit?: number | null
          total_return?: number | null
          updated_at?: string | null
          week_return?: number | null
          withdrawals_1m?: number | null
        }
        Update: {
          account_balance?: number | null
          created_at?: string | null
          date?: string
          day_return?: number | null
          deposits_1m?: number | null
          id?: string
          max_drawdown?: number | null
          month_return?: number | null
          quarter_return?: number | null
          total_profit?: number | null
          total_return?: number | null
          updated_at?: string | null
          week_return?: number | null
          withdrawals_1m?: number | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          rarity: string | null
          requirement_value: number | null
          sort_order: number | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          rarity?: string | null
          requirement_value?: number | null
          sort_order?: number | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string | null
          requirement_value?: number | null
          sort_order?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_resource_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_resource_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_resource_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          affiliate_code: string
          available_balance: number
          created_at: string
          id: string
          payment_email: string | null
          payment_method: string | null
          pix_key: string | null
          status: string
          total_earnings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          available_balance?: number
          created_at?: string
          id?: string
          payment_email?: string | null
          payment_method?: string | null
          pix_key?: string | null
          status?: string
          total_earnings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          available_balance?: number
          created_at?: string
          id?: string
          payment_email?: string | null
          payment_method?: string | null
          pix_key?: string | null
          status?: string
          total_earnings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          channel_id: string | null
          content: string
          id: string
          is_pinned: boolean | null
          message_id: string | null
          sent_at: string
          sent_by: string
          title: string
        }
        Insert: {
          channel_id?: string | null
          content: string
          id?: string
          is_pinned?: boolean | null
          message_id?: string | null
          sent_at?: string
          sent_by: string
          title: string
        }
        Update: {
          channel_id?: string | null
          content?: string
          id?: string
          is_pinned?: boolean | null
          message_id?: string | null
          sent_at?: string
          sent_by?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_collapsed: boolean | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_collapsed?: boolean | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_collapsed?: boolean | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      channels: {
        Row: {
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_admin_only: boolean
          is_bot_only: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_admin_only?: boolean
          is_bot_only?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_admin_only?: boolean
          is_bot_only?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "channels_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "channel_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          referral_id: string
          status: string
          tier: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          referral_id: string
          status?: string
          tier: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          referral_id?: string
          status?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_pinned: boolean | null
          metadata: Json | null
          post_type: string
          published_at: string | null
          report_id: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          post_type: string
          published_at?: string | null
          report_id?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          post_type?: string
          published_at?: string | null
          report_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports_daily"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          streak_count: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          streak_count?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          streak_count?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      health_scores: {
        Row: {
          created_at: string
          date: string
          drawdown_status: string | null
          id: string
          insight_text: string | null
          profile_type: string | null
          risk_level: string | null
          score: number
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          date: string
          drawdown_status?: string | null
          id?: string
          insight_text?: string | null
          profile_type?: string | null
          risk_level?: string | null
          score: number
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          date?: string
          drawdown_status?: string | null
          id?: string
          insight_text?: string | null
          profile_type?: string | null
          risk_level?: string | null
          score?: number
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: []
      }
      lead_profiles: {
        Row: {
          age_range: string
          created_at: string
          email: string
          full_name: string
          gender: string
          id: string
          income_range: string
          initial_investment: string
          investment_experience: string
          investor_profile: string
          is_trader: string
          prop_firm_status: string
          updated_at: string
          user_id: string
          whatsapp: string
          work_area: string
          work_area_other: string | null
        }
        Insert: {
          age_range: string
          created_at?: string
          email: string
          full_name: string
          gender: string
          id?: string
          income_range: string
          initial_investment: string
          investment_experience: string
          investor_profile: string
          is_trader: string
          prop_firm_status: string
          updated_at?: string
          user_id: string
          whatsapp: string
          work_area: string
          work_area_other?: string | null
        }
        Update: {
          age_range?: string
          created_at?: string
          email?: string
          full_name?: string
          gender?: string
          id?: string
          income_range?: string
          initial_investment?: string
          investment_experience?: string
          investor_profile?: string
          is_trader?: string
          prop_firm_status?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string
          work_area?: string
          work_area_other?: string | null
        }
        Relationships: []
      }
      link_previews: {
        Row: {
          created_at: string
          description: string | null
          fetched_at: string
          image_url: string | null
          site_name: string | null
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fetched_at?: string
          image_url?: string | null
          site_name?: string | null
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fetched_at?: string
          image_url?: string | null
          site_name?: string | null
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          starts_at: string
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          starts_at?: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          starts_at?: string
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          edited_at: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          image_url: string | null
          is_bot_message: boolean
          is_highlight: boolean | null
          is_pinned: boolean
          link_preview_url: string | null
          parent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_bot_message?: boolean
          is_highlight?: boolean | null
          is_pinned?: boolean
          link_preview_url?: string | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          is_bot_message?: boolean
          is_highlight?: boolean | null
          is_pinned?: boolean
          link_preview_url?: string | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reports: {
        Row: {
          action_note: string | null
          action_taken: string | null
          created_at: string
          id: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_note?: string | null
          action_taken?: string | null
          created_at?: string
          id?: string
          message_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_note?: string | null
          action_taken?: string | null
          created_at?: string
          id?: string
          message_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_returns: {
        Row: {
          created_at: string | null
          id: string
          month: string
          return_percent: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: string
          return_percent?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: string
          return_percent?: number | null
        }
        Relationships: []
      }
      mt5_account_snapshots: {
        Row: {
          balance: number | null
          captured_at: string
          created_at: string
          credit: number | null
          daily_pnl: number | null
          daily_trades: number | null
          daily_volume: number | null
          equity: number | null
          floating_profit: number | null
          free_margin: number | null
          id: string
          margin: number | null
          margin_level: number | null
          mt5_account_id: string
          open_positions: number | null
        }
        Insert: {
          balance?: number | null
          captured_at?: string
          created_at?: string
          credit?: number | null
          daily_pnl?: number | null
          daily_trades?: number | null
          daily_volume?: number | null
          equity?: number | null
          floating_profit?: number | null
          free_margin?: number | null
          id?: string
          margin?: number | null
          margin_level?: number | null
          mt5_account_id: string
          open_positions?: number | null
        }
        Update: {
          balance?: number | null
          captured_at?: string
          created_at?: string
          credit?: number | null
          daily_pnl?: number | null
          daily_trades?: number | null
          daily_volume?: number | null
          equity?: number | null
          floating_profit?: number | null
          free_margin?: number | null
          id?: string
          margin?: number | null
          margin_level?: number | null
          mt5_account_id?: string
          open_positions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mt5_account_snapshots_mt5_account_id_fkey"
            columns: ["mt5_account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mt5_accounts: {
        Row: {
          account_login: number
          api_token_hash: string
          broker: string | null
          created_at: string
          currency: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          leverage: number | null
          server: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_login: number
          api_token_hash: string
          broker?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          leverage?: number | null
          server: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_login?: number
          api_token_hash?: string
          broker?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          leverage?: number | null
          server?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mt5_cashflows: {
        Row: {
          amount: number
          comment: string | null
          created_at: string
          deal_ticket: number
          id: string
          mt5_account_id: string
          time: string
          type: string
        }
        Insert: {
          amount: number
          comment?: string | null
          created_at?: string
          deal_ticket: number
          id?: string
          mt5_account_id: string
          time: string
          type: string
        }
        Update: {
          amount?: number
          comment?: string | null
          created_at?: string
          deal_ticket?: number
          id?: string
          mt5_account_id?: string
          time?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mt5_cashflows_mt5_account_id_fkey"
            columns: ["mt5_account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mt5_daily_metrics: {
        Row: {
          created_at: string
          date: string
          deposits: number
          end_balance: number | null
          gross_profit: number
          id: string
          losses: number
          max_drawdown: number
          mt5_account_id: string
          net_profit: number
          operational_return: number
          start_balance: number | null
          trades: number
          updated_at: string
          volume: number
          wins: number
          withdrawals: number
        }
        Insert: {
          created_at?: string
          date: string
          deposits?: number
          end_balance?: number | null
          gross_profit?: number
          id?: string
          losses?: number
          max_drawdown?: number
          mt5_account_id: string
          net_profit?: number
          operational_return?: number
          start_balance?: number | null
          trades?: number
          updated_at?: string
          volume?: number
          wins?: number
          withdrawals?: number
        }
        Update: {
          created_at?: string
          date?: string
          deposits?: number
          end_balance?: number | null
          gross_profit?: number
          id?: string
          losses?: number
          max_drawdown?: number
          mt5_account_id?: string
          net_profit?: number
          operational_return?: number
          start_balance?: number | null
          trades?: number
          updated_at?: string
          volume?: number
          wins?: number
          withdrawals?: number
        }
        Relationships: [
          {
            foreignKeyName: "mt5_daily_metrics_mt5_account_id_fkey"
            columns: ["mt5_account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mt5_deals: {
        Row: {
          comment: string | null
          commission: number | null
          created_at: string
          deal_ticket: number
          entry: string | null
          fee: number | null
          id: string
          magic: number | null
          mt5_account_id: string
          position_id: number | null
          price: number | null
          profit: number | null
          swap: number | null
          symbol: string | null
          time: string
          type: string | null
          volume: number | null
        }
        Insert: {
          comment?: string | null
          commission?: number | null
          created_at?: string
          deal_ticket: number
          entry?: string | null
          fee?: number | null
          id?: string
          magic?: number | null
          mt5_account_id: string
          position_id?: number | null
          price?: number | null
          profit?: number | null
          swap?: number | null
          symbol?: string | null
          time: string
          type?: string | null
          volume?: number | null
        }
        Update: {
          comment?: string | null
          commission?: number | null
          created_at?: string
          deal_ticket?: number
          entry?: string | null
          fee?: number | null
          id?: string
          magic?: number | null
          mt5_account_id?: string
          position_id?: number | null
          price?: number | null
          profit?: number | null
          swap?: number | null
          symbol?: string | null
          time?: string
          type?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mt5_deals_mt5_account_id_fkey"
            columns: ["mt5_account_id"]
            isOneToOne: false
            referencedRelation: "mt5_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          related_channel_id: string | null
          related_message_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          related_channel_id?: string | null
          related_message_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          related_channel_id?: string | null
          related_message_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_channel_id_fkey"
            columns: ["related_channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_message_id_fkey"
            columns: ["related_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          dismissed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dismissed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string
          processed_at: string | null
          processed_by: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          option_text: string
          poll_id: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          option_text: string
          poll_id: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          option_text?: string
          poll_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          channel_id: string
          closes_at: string | null
          created_at: string | null
          id: string
          is_multiple_choice: boolean | null
          question: string
          user_id: string
        }
        Insert: {
          channel_id: string
          closes_at?: string | null
          created_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          question: string
          user_id: string
        }
        Update: {
          channel_id?: string
          closes_at?: string | null
          created_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      post_discussions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_highlighted: boolean | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_highlighted?: boolean | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_highlighted?: boolean | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_discussions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          discussion_id: string | null
          id: string
          post_id: string | null
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          post_id?: string | null
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          discussion_id?: string | null
          id?: string
          post_id?: string | null
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "post_discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          presence_status: string | null
          referred_by: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          presence_status?: string | null
          referred_by?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          presence_status?: string | null
          referred_by?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          tutorial_id: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          tutorial_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          tutorial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "tutorial_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean
          order_index: number
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean
          order_index?: number
          question_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean
          order_index?: number
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          order_index: number
          question: string
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          order_index?: number
          question: string
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          order_index?: number
          question?: string
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "tutorial_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          converted_at: string | null
          id: string
          referred_at: string
          referred_user_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          converted_at?: string | null
          id?: string
          referred_at?: string
          referred_user_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          converted_at?: string | null
          id?: string
          referred_at?: string
          referred_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_daily: {
        Row: {
          ai_comment: string | null
          created_at: string
          created_by: string | null
          date: string
          drawdown_percent: number
          id: string
          pnl_percent: number
          profile_type: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          trades_count: number
          updated_at: string
          win_rate: number
        }
        Insert: {
          ai_comment?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          drawdown_percent?: number
          id?: string
          pnl_percent?: number
          profile_type?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          trades_count?: number
          updated_at?: string
          win_rate?: number
        }
        Update: {
          ai_comment?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          drawdown_percent?: number
          id?: string
          pnl_percent?: number
          profile_type?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          trades_count?: number
          updated_at?: string
          win_rate?: number
        }
        Relationships: []
      }
      reports_weekly: {
        Row: {
          ai_summary: string | null
          created_at: string
          drawdown_percent: number
          id: string
          pnl_percent: number
          trades_count: number
          week_end: string
          week_start: string
          win_rate: number
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          drawdown_percent?: number
          id?: string
          pnl_percent?: number
          trades_count?: number
          week_end: string
          week_start: string
          win_rate?: number
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          drawdown_percent?: number
          id?: string
          pnl_percent?: number
          trades_count?: number
          week_end?: string
          week_start?: string
          win_rate?: number
        }
        Relationships: []
      }
      robots: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          description: string | null
          external_cta_label: string
          external_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          min_deposit: number | null
          monthly_returns: Json
          name: string
          pairs: string[]
          platform: string
          risk_level: string
          screenshots: string[]
          slug: string
          sort_order: number
          tagline: string | null
          tier_required: string
          timeframe: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_cta_label?: string
          external_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          min_deposit?: number | null
          monthly_returns?: Json
          name: string
          pairs?: string[]
          platform?: string
          risk_level?: string
          screenshots?: string[]
          slug: string
          sort_order?: number
          tagline?: string | null
          tier_required?: string
          timeframe?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_cta_label?: string
          external_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          min_deposit?: number | null
          monthly_returns?: Json
          name?: string
          pairs?: string[]
          platform?: string
          risk_level?: string
          screenshots?: string[]
          slug?: string
          sort_order?: number
          tagline?: string | null
          tier_required?: string
          timeframe?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          created_by: string | null
          executed_at: string | null
          id: string
          is_pinned: boolean
          message_id: string | null
          repeat_type: string | null
          scheduled_for: string
          status: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          created_by?: string | null
          executed_at?: string | null
          id?: string
          is_pinned?: boolean
          message_id?: string | null
          repeat_type?: string | null
          scheduled_for: string
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          executed_at?: string | null
          id?: string
          is_pinned?: boolean
          message_id?: string | null
          repeat_type?: string | null
          scheduled_for?: string
          status?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "bot_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      season_achievements: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          rarity: string | null
          requirement_type: string
          requirement_value: number | null
          season_id: string | null
          sort_order: number | null
          xp_reward: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          rarity?: string | null
          requirement_type: string
          requirement_value?: number | null
          season_id?: string | null
          sort_order?: number | null
          xp_reward?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          rarity?: string | null
          requirement_type?: string
          requirement_value?: number | null
          season_id?: string | null
          sort_order?: number | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "season_achievements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      season_rankings: {
        Row: {
          archived_at: string | null
          category: string
          id: string
          rank: number
          score: number
          season_id: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          category: string
          id?: string
          rank: number
          score: number
          season_id: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          category?: string
          id?: string
          rank?: number
          score?: number
          season_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "season_rankings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          number: number
          quarter: number
          start_date: string
          theme: string
          theme_emoji: string
          year: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          number: number
          quarter: number
          start_date: string
          theme: string
          theme_emoji: string
          year: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          number?: number
          quarter?: number
          start_date?: string
          theme?: string
          theme_emoji?: string
          year?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_admin_reply: boolean | null
          sender_id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          sender_id: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          closed_at: string | null
          created_at: string | null
          id: string
          priority: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_config: {
        Row: {
          created_at: string
          currency: string
          id: string
          initial_balance: number
          max_drawdown_override: number | null
          start_date: string
          total_deposits: number | null
          total_withdrawals: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          max_drawdown_override?: number | null
          start_date?: string
          total_deposits?: number | null
          total_withdrawals?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          max_drawdown_override?: number | null
          start_date?: string
          total_deposits?: number | null
          total_withdrawals?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tutorial_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_visible: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tutorial_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          tutorial_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorial_quizzes: {
        Row: {
          created_at: string
          id: string
          max_attempts: number | null
          passing_score: number
          tutorial_id: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_score?: number
          tutorial_id: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_score?: number
          tutorial_id?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_quizzes_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: true
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          category: string
          category_id: string | null
          content: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          description: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          tier_required: Database["public"]["Enums"]["membership_tier"]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          tier_required?: Database["public"]["Enums"]["membership_tier"]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutorials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tutorial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_channel_read_status: {
        Row: {
          channel_id: string
          created_at: string
          id: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_channel_read_status_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          created_at: string | null
          id: string
          muted_channels: string[] | null
          notify_mentions: boolean | null
          notify_replies: boolean | null
          push_enabled: boolean
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          muted_channels?: string[] | null
          notify_mentions?: boolean | null
          notify_replies?: boolean | null
          push_enabled?: boolean
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          muted_channels?: string[] | null
          notify_mentions?: boolean | null
          notify_replies?: boolean | null
          push_enabled?: boolean
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_season_achievements: {
        Row: {
          achievement_id: string
          id: string
          season_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          season_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          season_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_season_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "season_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_season_achievements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_season_progress: {
        Row: {
          created_at: string | null
          id: string
          prestige_level: number | null
          season_id: string
          season_level: number | null
          season_xp: number | null
          streak_penalty_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          prestige_level?: number | null
          season_id: string
          season_level?: number | null
          season_xp?: number | null
          streak_penalty_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          prestige_level?: number | null
          season_id?: string
          season_level?: number | null
          season_xp?: number | null
          streak_penalty_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_season_progress_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_titles: {
        Row: {
          earned_at: string | null
          id: string
          is_equipped: boolean | null
          season_id: string | null
          title_code: string
          title_emoji: string | null
          title_name: string
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          season_id?: string | null
          title_code: string
          title_emoji?: string | null
          title_name: string
          user_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          is_equipped?: boolean | null
          season_id?: string | null
          title_code?: string
          title_emoji?: string | null
          title_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_titles_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trading_journal: {
        Row: {
          created_at: string | null
          date: string
          emotional_state: string | null
          followed_plan: boolean | null
          id: string
          losses: number | null
          notes: string | null
          pnl_percent: number | null
          trades_count: number | null
          updated_at: string | null
          user_id: string
          wins: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          emotional_state?: string | null
          followed_plan?: boolean | null
          id?: string
          losses?: number | null
          notes?: string | null
          pnl_percent?: number | null
          trades_count?: number | null
          updated_at?: string | null
          user_id: string
          wins?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          emotional_state?: string | null
          followed_plan?: boolean | null
          id?: string
          losses?: number | null
          notes?: string | null
          pnl_percent?: number | null
          trades_count?: number | null
          updated_at?: string | null
          user_id?: string
          wins?: number | null
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          current_title: string | null
          id: string
          prestige_bonus: number | null
          prestige_level: number | null
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_title?: string | null
          id?: string
          prestige_bonus?: number | null
          prestige_level?: number | null
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_title?: string | null
          id?: string
          prestige_bonus?: number | null
          prestige_level?: number | null
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          multiplier: number | null
          season_id: string | null
          source: string
          user_id: string
          xp_season: number
          xp_total: number
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          multiplier?: number | null
          season_id?: string | null
          source: string
          user_id: string
          xp_season?: number
          xp_total?: number
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          multiplier?: number | null
          season_id?: string | null
          source?: string
          user_id?: string
          xp_season?: number
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      quiz_options_public: {
        Row: {
          id: string | null
          order_index: number | null
          question_id: string | null
          text: string | null
        }
        Insert: {
          id?: string | null
          order_index?: number | null
          question_id?: string | null
          text?: string | null
        }
        Update: {
          id?: string | null
          order_index?: number | null
          question_id?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_xp: {
        Args: {
          _amount: number
          _details?: Json
          _multiplier?: number
          _source: string
        }
        Returns: Json
      }
      calculate_health_score: {
        Args: { target_date: string }
        Returns: {
          calc_drawdown_status: string
          calc_insight_text: string
          calc_profile_type: string
          calc_risk_level: string
          calc_score: number
          calc_status: string
        }[]
      }
      calculate_season_level: { Args: { p_xp: number }; Returns: number }
      claim_achievement: { Args: { _achievement_id: string }; Returns: Json }
      claim_achievement_by_code: { Args: { _code: string }; Returns: Json }
      claim_season_achievement: {
        Args: { _achievement_id: string }
        Returns: Json
      }
      generate_affiliate_code: { Args: never; Returns: string }
      get_active_season: {
        Args: never
        Returns: {
          days_remaining: number
          description: string
          end_date: string
          id: string
          name: string
          number: number
          quarter: number
          start_date: string
          theme: string
          theme_emoji: string
          year: number
        }[]
      }
      get_daily_xp_caps: {
        Args: { p_date?: string; p_user_id: string }
        Returns: {
          cap: number
          remaining: number
          source: string
          used: number
        }[]
      }
      get_unread_counts: {
        Args: { p_user_id: string }
        Returns: {
          channel_id: string
          unread_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_mod: { Args: { _user_id: string }; Returns: boolean }
      recheck_achievements: { Args: { _user_id: string }; Returns: undefined }
      recompute_mt5_daily_metrics: {
        Args: { p_account: string; p_date: string }
        Returns: undefined
      }
      send_mention_notification: {
        Args: {
          _channel_id: string
          _channel_name: string
          _content: string
          _message_id: string
          _target_user_id: string
        }
        Returns: undefined
      }
      send_reply_notification: {
        Args: {
          _channel_id: string
          _channel_name: string
          _content: string
          _reply_message_id: string
          _target_user_id: string
        }
        Returns: undefined
      }
      submit_quiz_attempt: {
        Args: { p_answers: Json; p_quiz_id: string; p_tutorial_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      membership_tier: "free" | "plus" | "elite"
      report_status: "success" | "warning" | "danger"
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
      app_role: ["admin", "moderator", "user"],
      membership_tier: ["free", "plus", "elite"],
      report_status: ["success", "warning", "danger"],
    },
  },
} as const
