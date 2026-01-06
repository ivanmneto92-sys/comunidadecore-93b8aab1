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
      channels: {
        Row: {
          category: string
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
        Relationships: []
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
          id: string
          image_url: string | null
          is_bot_message: boolean
          is_highlight: boolean | null
          is_pinned: boolean
          parent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          image_url?: string | null
          is_bot_message?: boolean
          is_highlight?: boolean | null
          is_pinned?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          image_url?: string | null
          is_bot_message?: boolean
          is_highlight?: boolean | null
          is_pinned?: boolean
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
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          referred_by: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          referred_by?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          referred_by?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
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
      tutorials: {
        Row: {
          category: string
          content: string | null
          created_at: string
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
          content?: string | null
          created_at?: string
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
          content?: string | null
          created_at?: string
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
        Relationships: []
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
      user_xp: {
        Row: {
          created_at: string
          current_level: number
          id: string
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          id?: string
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_affiliate_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_mod: { Args: { _user_id: string }; Returns: boolean }
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
