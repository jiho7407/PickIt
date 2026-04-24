export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      anonymous_sessions: {
        Row: {
          created_at: string
          id: string
          session_hash: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_hash: string
        }
        Update: {
          created_at?: string
          id?: string
          session_hash?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          dilemma_id: string
          id: string
          vote_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          dilemma_id: string
          id?: string
          vote_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          dilemma_id?: string
          id?: string
          vote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemma_vote_summaries"
            referencedColumns: ["dilemma_id"]
          },
          {
            foreignKeyName: "comments_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_vote_id_fkey"
            columns: ["vote_id"]
            isOneToOne: true
            referencedRelation: "votes"
            referencedColumns: ["id"]
          },
        ]
      }
      dilemmas: {
        Row: {
          author_id: string
          category: string
          created_at: string
          followup_due_at: string
          id: string
          image_path: string | null
          price: number
          product_name: string
          situation: string
          status: string
          title: string
          updated_at: string
          vote_type: string
        }
        Insert: {
          author_id: string
          category: string
          created_at?: string
          followup_due_at?: string
          id?: string
          image_path?: string | null
          price: number
          product_name: string
          situation: string
          status?: string
          title: string
          updated_at?: string
          vote_type?: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          followup_due_at?: string
          id?: string
          image_path?: string | null
          price?: number
          product_name?: string
          situation?: string
          status?: string
          title?: string
          updated_at?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dilemmas_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followups: {
        Row: {
          author_id: string
          dilemma_id: string
          id: string
          note: string | null
          outcome: string
          responded_at: string
          satisfaction_score: number | null
          saved_amount: number
        }
        Insert: {
          author_id: string
          dilemma_id: string
          id?: string
          note?: string | null
          outcome: string
          responded_at?: string
          satisfaction_score?: number | null
          saved_amount?: number
        }
        Update: {
          author_id?: string
          dilemma_id?: string
          id?: string
          note?: string | null
          outcome?: string
          responded_at?: string
          satisfaction_score?: number | null
          saved_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "followups_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: true
            referencedRelation: "dilemma_vote_summaries"
            referencedColumns: ["dilemma_id"]
          },
          {
            foreignKeyName: "followups_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: true
            referencedRelation: "dilemmas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_year: number | null
          created_at: string
          gender: string | null
          id: string
          life_stage: string | null
          nickname: string
          role: string
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          id: string
          life_stage?: string | null
          nickname: string
          role?: string
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          life_stage?: string | null
          nickname?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      vote_options: {
        Row: {
          created_at: string
          dilemma_id: string
          id: string
          image_path: string | null
          label: string
          position: number
          price: number | null
        }
        Insert: {
          created_at?: string
          dilemma_id: string
          id?: string
          image_path?: string | null
          label: string
          position: number
          price?: number | null
        }
        Update: {
          created_at?: string
          dilemma_id?: string
          id?: string
          image_path?: string | null
          label?: string
          position?: number
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vote_options_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemma_vote_summaries"
            referencedColumns: ["dilemma_id"]
          },
          {
            foreignKeyName: "vote_options_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemmas"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          anonymous_session_id: string | null
          choice: string | null
          created_at: string
          dilemma_id: string
          id: string
          option_id: string | null
          voter_id: string | null
        }
        Insert: {
          anonymous_session_id?: string | null
          choice?: string | null
          created_at?: string
          dilemma_id: string
          id?: string
          option_id?: string | null
          voter_id?: string | null
        }
        Update: {
          anonymous_session_id?: string | null
          choice?: string | null
          created_at?: string
          dilemma_id?: string
          id?: string
          option_id?: string | null
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_anonymous_session_id_fkey"
            columns: ["anonymous_session_id"]
            isOneToOne: false
            referencedRelation: "anonymous_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemma_vote_summaries"
            referencedColumns: ["dilemma_id"]
          },
          {
            foreignKeyName: "votes_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "dilemmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "vote_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dilemma_vote_summaries: {
        Row: {
          buy_count: number | null
          buy_ratio: number | null
          dilemma_id: string | null
          option_a_count: number | null
          option_b_count: number | null
          skip_count: number | null
          skip_ratio: number | null
          total_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_followup_candidates: {
        Args: { now_ts?: string }
        Returns: {
          days_overdue: number
          dilemma_id: string
          followup_due_at: string
          price: number
          product_name: string
          title: string
          total_count: number
        }[]
      }
      get_my_notification_candidates: {
        Args: never
        Returns: {
          author_id: string
          dilemma_id: string
          kind: string
        }[]
      }
      get_operator_notification_candidates: {
        Args: never
        Returns: {
          author_id: string
          dilemma_id: string
          kind: string
        }[]
      }
      vote_result_notification_threshold: { Args: never; Returns: number }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

