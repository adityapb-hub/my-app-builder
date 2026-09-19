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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_participants: {
        Row: {
          id: string
          joined_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_participants_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "community_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      community_tasks: {
        Row: {
          apartment_name: string | null
          category: string
          cost_per_household: number
          created_at: string
          creator_id: string | null
          creator_name: string
          description: string | null
          event_date: string | null
          id: string
          joined_count: number
          location: string | null
          seats_needed: number
          status: string
          title: string
          updated_at: string
          votes: number
        }
        Insert: {
          apartment_name?: string | null
          category?: string
          cost_per_household?: number
          created_at?: string
          creator_id?: string | null
          creator_name?: string
          description?: string | null
          event_date?: string | null
          id?: string
          joined_count?: number
          location?: string | null
          seats_needed?: number
          status?: string
          title: string
          updated_at?: string
          votes?: number
        }
        Update: {
          apartment_name?: string | null
          category?: string
          cost_per_household?: number
          created_at?: string
          creator_id?: string | null
          creator_name?: string
          description?: string | null
          event_date?: string | null
          id?: string
          joined_count?: number
          location?: string | null
          seats_needed?: number
          status?: string
          title?: string
          updated_at?: string
          votes?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          request_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          area: string | null
          avatar_url: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          avatar_url?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          avatar_url?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          provider_id: string
          rating: number
          request_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          provider_id: string
          rating: number
          request_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          provider_id?: string
          rating?: number
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          area: string | null
          availability: string | null
          available_now: boolean
          avatar_url: string | null
          bio: string | null
          category: string
          certificate_url: string | null
          created_at: string
          display_name: string
          distance_km: number
          experience_years: number
          hourly_rate: number
          id: string
          id_document_url: string | null
          jobs_completed: number
          rating: number
          rating_count: number
          skills: string[]
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          area?: string | null
          availability?: string | null
          available_now?: boolean
          avatar_url?: string | null
          bio?: string | null
          category: string
          certificate_url?: string | null
          created_at?: string
          display_name: string
          distance_km?: number
          experience_years?: number
          hourly_rate?: number
          id?: string
          id_document_url?: string | null
          jobs_completed?: number
          rating?: number
          rating_count?: number
          skills?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          area?: string | null
          availability?: string | null
          available_now?: boolean
          avatar_url?: string | null
          bio?: string | null
          category?: string
          certificate_url?: string | null
          created_at?: string
          display_name?: string
          distance_km?: number
          experience_years?: number
          hourly_rate?: number
          id?: string
          id_document_url?: string | null
          jobs_completed?: number
          rating?: number
          rating_count?: number
          skills?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          address: string | null
          area: string | null
          category: string
          created_at: string
          customer_id: string
          description: string | null
          final_price: number | null
          id: string
          photo_urls: string[]
          preferred_date: string | null
          preferred_time: string | null
          provider_id: string | null
          quoted_price: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          category: string
          created_at?: string
          customer_id: string
          description?: string | null
          final_price?: number | null
          id?: string
          photo_urls?: string[]
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id?: string | null
          quoted_price?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          category?: string
          created_at?: string
          customer_id?: string
          description?: string | null
          final_price?: number | null
          id?: string
          photo_urls?: string[]
          preferred_date?: string | null
          preferred_time?: string | null
          provider_id?: string | null
          quoted_price?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
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
      community_vote: { Args: { p_task: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "seeker" | "provider" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["seeker", "provider", "admin"],
    },
  },
} as const
