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
      candidate_profiles: {
        Row: {
          created_at: string
          email: string | null
          expected_salary: string | null
          experience_years: number
          full_name: string
          headline: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          notice_period: string | null
          open_to_work: boolean
          phone: string | null
          portfolio_url: string | null
          preferred_locations: string[]
          preferred_roles: string[]
          resume_filename: string | null
          resume_path: string | null
          resume_updated_at: string | null
          resume_url: string | null
          skills: string[]
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expected_salary?: string | null
          experience_years?: number
          full_name?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          notice_period?: string | null
          open_to_work?: boolean
          phone?: string | null
          portfolio_url?: string | null
          preferred_locations?: string[]
          preferred_roles?: string[]
          resume_filename?: string | null
          resume_path?: string | null
          resume_updated_at?: string | null
          resume_url?: string | null
          skills?: string[]
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expected_salary?: string | null
          experience_years?: number
          full_name?: string
          headline?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          notice_period?: string | null
          open_to_work?: boolean
          phone?: string | null
          portfolio_url?: string | null
          preferred_locations?: string[]
          preferred_roles?: string[]
          resume_filename?: string | null
          resume_path?: string | null
          resume_updated_at?: string | null
          resume_url?: string | null
          skills?: string[]
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      candidate_resume_versions: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string
          evolution_summary: Json
          id: string
          latest_changes: Json
          parsed: Json
          raw_text: string | null
          resume_filename: string | null
          resume_path: string | null
          resume_url: string | null
          summary: string | null
          updated_at: string
          version: number
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by: string
          evolution_summary?: Json
          id?: string
          latest_changes?: Json
          parsed?: Json
          raw_text?: string | null
          resume_filename?: string | null
          resume_path?: string | null
          resume_url?: string | null
          summary?: string | null
          updated_at?: string
          version: number
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string
          evolution_summary?: Json
          id?: string
          latest_changes?: Json
          parsed?: Json
          raw_text?: string | null
          resume_filename?: string | null
          resume_path?: string | null
          resume_url?: string | null
          summary?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_resume_versions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          resume_filename: string | null
          resume_path: string | null
          resume_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          resume_filename?: string | null
          resume_path?: string | null
          resume_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          resume_filename?: string | null
          resume_path?: string | null
          resume_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_interviews: {
        Row: {
          candidate_name: string
          created_at: string
          created_by: string
          id: string
          interviewer: string | null
          job_id: string
          mode: string
          notes: string | null
          round: string | null
          scheduled_at: string
          status: string
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_name: string
          created_at?: string
          created_by: string
          id?: string
          interviewer?: string | null
          job_id: string
          mode?: string
          notes?: string | null
          round?: string | null
          scheduled_at: string
          status?: string
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_name?: string
          created_at?: string
          created_by?: string
          id?: string
          interviewer?: string | null
          job_id?: string
          mode?: string
          notes?: string | null
          round?: string | null
          scheduled_at?: string
          status?: string
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_interviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_interviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "job_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_submissions: {
        Row: {
          applied_via: string | null
          candidate_email: string | null
          candidate_name: string
          candidate_phone: string | null
          candidate_user_id: string | null
          created_at: string
          created_by: string
          id: string
          job_id: string
          notes: string | null
          reject_reason: string | null
          reject_reason_color: string | null
          resume_url: string | null
          score: number | null
          stage: string
          updated_at: string
        }
        Insert: {
          applied_via?: string | null
          candidate_email?: string | null
          candidate_name: string
          candidate_phone?: string | null
          candidate_user_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          job_id: string
          notes?: string | null
          reject_reason?: string | null
          reject_reason_color?: string | null
          resume_url?: string | null
          score?: number | null
          stage?: string
          updated_at?: string
        }
        Update: {
          applied_via?: string | null
          candidate_email?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          candidate_user_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          job_id?: string
          notes?: string | null
          reject_reason?: string | null
          reject_reason_color?: string | null
          resume_url?: string | null
          score?: number | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_screening_questions: Json | null
          ai_summary: string | null
          answers: Json
          client: string | null
          client_answers: Json
          created_at: string
          created_by: string
          employment_type: string | null
          experience: string | null
          filled: number
          id: string
          jd_markdown: string | null
          location: string | null
          positions: number
          priority: string
          salary: string | null
          skills: string[]
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_screening_questions?: Json | null
          ai_summary?: string | null
          answers?: Json
          client?: string | null
          client_answers?: Json
          created_at?: string
          created_by: string
          employment_type?: string | null
          experience?: string | null
          filled?: number
          id?: string
          jd_markdown?: string | null
          location?: string | null
          positions?: number
          priority?: string
          salary?: string | null
          skills?: string[]
          source?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_screening_questions?: Json | null
          ai_summary?: string | null
          answers?: Json
          client?: string | null
          client_answers?: Json
          created_at?: string
          created_by?: string
          employment_type?: string | null
          experience?: string | null
          filled?: number
          id?: string
          jd_markdown?: string | null
          location?: string | null
          positions?: number
          priority?: string
          salary?: string | null
          skills?: string[]
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "candidate"
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
      app_role: ["admin", "recruiter", "candidate"],
    },
  },
} as const
