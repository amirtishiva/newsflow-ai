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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          details: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string
          event_type?: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_drafts: {
        Row: {
          content: string
          content_length: Database["public"]["Enums"]["content_length"]
          created_at: string
          id: string
          status: Database["public"]["Enums"]["draft_status"]
          topic_id: string | null
          topic_title: string
          tweet_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          content_length?: Database["public"]["Enums"]["content_length"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["draft_status"]
          topic_id?: string | null
          topic_title: string
          tweet_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_length?: Database["public"]["Enums"]["content_length"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["draft_status"]
          topic_id?: string | null
          topic_title?: string
          tweet_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_drafts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "trending_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_sources: {
        Row: {
          added_at: string
          handle: string
          id: string
          label: string
          type: Database["public"]["Enums"]["source_type"]
          user_id: string
        }
        Insert: {
          added_at?: string
          handle: string
          id?: string
          label: string
          type: Database["public"]["Enums"]["source_type"]
          user_id: string
        }
        Update: {
          added_at?: string
          handle?: string
          id?: string
          label?: string
          type?: Database["public"]["Enums"]["source_type"]
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          full_name: string
          id: string
          location: string | null
          onboarding_complete: boolean
          title: string | null
          twitter_handle: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string
          id: string
          location?: string | null
          onboarding_complete?: boolean
          title?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string
          id?: string
          location?: string | null
          onboarding_complete?: boolean
          title?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      research_reports: {
        Row: {
          generated_at: string
          id: string
          key_facts: Json
          quotes: Json
          significance_score: number
          sources: Json
          summary: string
          timeline: Json
          topic_id: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          key_facts?: Json
          quotes?: Json
          significance_score?: number
          sources?: Json
          summary?: string
          timeline?: Json
          topic_id?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          key_facts?: Json
          quotes?: Json
          significance_score?: number
          sources?: Json
          summary?: string
          timeline?: Json
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "trending_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      training_scripts: {
        Row: {
          file_name: string
          file_size: string
          id: string
          status: Database["public"]["Enums"]["script_status"]
          storage_path: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          file_size: string
          id?: string
          status?: Database["public"]["Enums"]["script_status"]
          storage_path?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          file_size?: string
          id?: string
          status?: Database["public"]["Enums"]["script_status"]
          storage_path?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trending_topics: {
        Row: {
          created_at: string
          engagement: number
          has_draft: boolean
          id: string
          significance_score: number
          source: Database["public"]["Enums"]["source_type"]
          source_handle: string
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engagement?: number
          has_draft?: boolean
          id?: string
          significance_score?: number
          source: Database["public"]["Enums"]["source_type"]
          source_handle: string
          summary?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          engagement?: number
          has_draft?: boolean
          id?: string
          significance_score?: number
          source?: Database["public"]["Enums"]["source_type"]
          source_handle?: string
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          alert_threshold: number
          default_length: Database["public"]["Enums"]["content_length"]
          digest_days: string[]
          digest_enabled: boolean
          digest_time: string
          email_alerts: boolean
          id: string
          in_app_alerts: boolean
          notif_frequency: string
          quiet_end: string
          quiet_hours_enabled: boolean
          quiet_start: string
          trend_alerts: boolean
          twitter_connected: boolean
          twitter_handle: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_threshold?: number
          default_length?: Database["public"]["Enums"]["content_length"]
          digest_days?: string[]
          digest_enabled?: boolean
          digest_time?: string
          email_alerts?: boolean
          id?: string
          in_app_alerts?: boolean
          notif_frequency?: string
          quiet_end?: string
          quiet_hours_enabled?: boolean
          quiet_start?: string
          trend_alerts?: boolean
          twitter_connected?: boolean
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_threshold?: number
          default_length?: Database["public"]["Enums"]["content_length"]
          digest_days?: string[]
          digest_enabled?: boolean
          digest_time?: string
          email_alerts?: boolean
          id?: string
          in_app_alerts?: boolean
          notif_frequency?: string
          quiet_end?: string
          quiet_hours_enabled?: boolean
          quiet_start?: string
          trend_alerts?: boolean
          twitter_connected?: boolean
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_event_type:
        | "auth_login"
        | "auth_logout"
        | "draft_approved"
        | "draft_rejected"
        | "draft_edited"
        | "post_published"
        | "post_deleted"
        | "source_added"
        | "source_removed"
        | "script_uploaded"
        | "script_removed"
        | "settings_updated"
        | "profile_updated"
      app_role: "reporter" | "editor" | "admin"
      content_length: "short" | "medium" | "long"
      draft_status: "pending" | "approved" | "rejected" | "published"
      notification_type:
        | "trend_alert"
        | "training_complete"
        | "delivery"
        | "override"
      script_status: "processing" | "complete" | "error"
      source_type: "twitter" | "rss" | "youtube"
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
      activity_event_type: [
        "auth_login",
        "auth_logout",
        "draft_approved",
        "draft_rejected",
        "draft_edited",
        "post_published",
        "post_deleted",
        "source_added",
        "source_removed",
        "script_uploaded",
        "script_removed",
        "settings_updated",
        "profile_updated",
      ],
      app_role: ["reporter", "editor", "admin"],
      content_length: ["short", "medium", "long"],
      draft_status: ["pending", "approved", "rejected", "published"],
      notification_type: [
        "trend_alert",
        "training_complete",
        "delivery",
        "override",
      ],
      script_status: ["processing", "complete", "error"],
      source_type: ["twitter", "rss", "youtube"],
    },
  },
} as const
