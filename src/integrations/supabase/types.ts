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
      billing_customers: {
        Row: {
          created_at: string
          email: string | null
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string | null
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          layout: Json
          published: boolean
          published_at: string | null
          read_minutes: number | null
          slug: string
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          layout?: Json
          published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug: string
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          layout?: Json
          published?: boolean
          published_at?: string | null
          read_minutes?: number | null
          slug?: string
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          company_size: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          message: string
          name: string
          notes: string | null
          phone: string | null
          reason: string | null
          region: string | null
          status: string
        }
        Insert: {
          company?: string | null
          company_size?: string | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          reason?: string | null
          region?: string | null
          status?: string
        }
        Update: {
          company?: string | null
          company_size?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          reason?: string | null
          region?: string | null
          status?: string
        }
        Relationships: []
      }
      credit_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string
          reference: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason: string
          reference?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          reference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string
          created_at: string
          email: string
          id: string
          name: string
          source: string | null
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          id?: string
          name: string
          source?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          source?: string | null
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string
          export_url: string
          format: string
          id: string
          project_id: string
          resolution: string
          user_id: string
        }
        Insert: {
          created_at?: string
          export_url: string
          format?: string
          id?: string
          project_id: string
          resolution?: string
          user_id: string
        }
        Update: {
          created_at?: string
          export_url?: string
          format?: string
          id?: string
          project_id?: string
          resolution?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generations: {
        Row: {
          created_at: string
          id: string
          input_image_url: string
          output_image_url: string | null
          prompt: string | null
          room_type: string | null
          status: string
          template_key: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_image_url: string
          output_image_url?: string | null
          prompt?: string | null
          room_type?: string | null
          status?: string
          template_key?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input_image_url?: string
          output_image_url?: string | null
          prompt?: string | null
          room_type?: string | null
          status?: string
          template_key?: string | null
          user_id?: string
        }
        Relationships: []
      }
      layers: {
        Row: {
          blend_mode: string
          created_at: string
          flip_x: boolean
          flip_y: boolean
          id: string
          name: string
          offset_x: number
          offset_y: number
          opacity: number
          order_index: number
          project_id: string
          rotation: number
          scale: number
          texture_url: string | null
          tile: boolean
          updated_at: string
          user_id: string
          visible: boolean
        }
        Insert: {
          blend_mode?: string
          created_at?: string
          flip_x?: boolean
          flip_y?: boolean
          id?: string
          name?: string
          offset_x?: number
          offset_y?: number
          opacity?: number
          order_index?: number
          project_id: string
          rotation?: number
          scale?: number
          texture_url?: string | null
          tile?: boolean
          updated_at?: string
          user_id: string
          visible?: boolean
        }
        Update: {
          blend_mode?: string
          created_at?: string
          flip_x?: boolean
          flip_y?: boolean
          id?: string
          name?: string
          offset_x?: number
          offset_y?: number
          opacity?: number
          order_index?: number
          project_id?: string
          rotation?: number
          scale?: number
          texture_url?: string | null
          tile?: boolean
          updated_at?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "layers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_total: number | null
          created_at: string
          currency: string | null
          email: string | null
          id: string
          mode: string | null
          product_key: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id: string
          mode?: string | null
          product_key?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          currency?: string | null
          email?: string | null
          id?: string
          mode?: string | null
          product_key?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          base_image_url: string | null
          canvas_height: number
          canvas_width: number
          created_at: string
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_image_url?: string | null
          canvas_height?: number
          canvas_width?: number
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_image_url?: string | null
          canvas_height?: number
          canvas_width?: number
          created_at?: string
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string
          type: string | null
        }
        Insert: {
          id: string
          processed_at?: string
          type?: string | null
        }
        Update: {
          id?: string
          processed_at?: string
          type?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          interval: string | null
          plan_key: string | null
          price_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id: string
          interval?: string | null
          plan_key?: string | null
          price_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          interval?: string | null
          plan_key?: string | null
          price_id?: string | null
          status?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      credit_balance: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      spend_credit: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "user"
      plan_type: "free" | "pro"
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
      app_role: ["admin", "user"],
      plan_type: ["free", "pro"],
    },
  },
} as const
