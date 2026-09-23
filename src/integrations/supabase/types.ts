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
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          is_admin: boolean
          membership_type: Database["public"]["Enums"]["organization_membership_type"]
          organization_id: string
          revoked_at: string | null
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at?: string
          id?: string
          is_admin?: boolean
          membership_type: Database["public"]["Enums"]["organization_membership_type"]
          organization_id: string
          revoked_at?: string | null
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          is_admin?: boolean
          membership_type?: Database["public"]["Enums"]["organization_membership_type"]
          organization_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          membership_type: Database["public"]["Enums"]["organization_membership_type"]
          organization_id: string
          person_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          membership_type: Database["public"]["Enums"]["organization_membership_type"]
          organization_id: string
          person_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          membership_type?: Database["public"]["Enums"]["organization_membership_type"]
          organization_id?: string
          person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      persons: {
        Row: {
          auth_user_id: string
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      work_block_participations: {
        Row: {
          created_at: string
          work_block_id: string
          work_id: string
          work_participation_id: string
        }
        Insert: {
          created_at?: string
          work_block_id: string
          work_id: string
          work_participation_id: string
        }
        Update: {
          created_at?: string
          work_block_id?: string
          work_id?: string
          work_participation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_block_participations_work_block_id_work_id_fkey"
            columns: ["work_block_id", "work_id"]
            isOneToOne: false
            referencedRelation: "work_blocks"
            referencedColumns: ["id", "work_id"]
          },
          {
            foreignKeyName: "work_block_participations_work_participation_id_work_id_fkey"
            columns: ["work_participation_id", "work_id"]
            isOneToOne: false
            referencedRelation: "work_participations"
            referencedColumns: ["id", "work_id"]
          },
        ]
      }
      work_blocks: {
        Row: {
          block_type: string
          created_at: string
          ends_at: string
          id: string
          label: string
          starts_at: string
          updated_at: string
          work_id: string
        }
        Insert: {
          block_type: string
          created_at?: string
          ends_at: string
          id?: string
          label: string
          starts_at: string
          updated_at?: string
          work_id: string
        }
        Update: {
          block_type?: string
          created_at?: string
          ends_at?: string
          id?: string
          label?: string
          starts_at?: string
          updated_at?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_blocks_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      work_participation_functions: {
        Row: {
          created_at: string
          function_name: string
          id: string
          work_participation_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          work_participation_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          work_participation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_participation_functions_work_participation_id_fkey"
            columns: ["work_participation_id"]
            isOneToOne: false
            referencedRelation: "work_participations"
            referencedColumns: ["id"]
          },
        ]
      }
      work_participations: {
        Row: {
          created_at: string
          id: string
          person_id: string
          work_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          person_id: string
          work_id: string
        }
        Update: {
          created_at?: string
          id?: string
          person_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_participations_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_participations_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "works"
            referencedColumns: ["id"]
          },
        ]
      }
      works: {
        Row: {
          created_at: string
          created_by: string
          ends_at: string
          id: string
          organizer_organization_id: string | null
          organizer_person_id: string | null
          starts_at: string
          status: string
          timezone: string
          title: string
          updated_at: string
          work_type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          ends_at: string
          id?: string
          organizer_organization_id?: string | null
          organizer_person_id?: string | null
          starts_at: string
          status?: string
          timezone: string
          title: string
          updated_at?: string
          work_type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          organizer_organization_id?: string | null
          organizer_person_id?: string | null
          starts_at?: string
          status?: string
          timezone?: string
          title?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "works_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_organizer_organization_id_fkey"
            columns: ["organizer_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "works_organizer_person_id_fkey"
            columns: ["organizer_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_organization_invitation: {
        Args: { p_token: string }
        Returns: string
      }
      active_organization_id: { Args: never; Returns: string }
      add_work_participant: {
        Args: { p_person_id: string; p_work_id: string }
        Returns: string
      }
      add_work_participation_function: {
        Args: {
          p_function_name: string
          p_work_id: string
          p_work_participation_id: string
        }
        Returns: string
      }
      assign_work_participant_to_block: {
        Args: {
          p_work_block_id: string
          p_work_id: string
          p_work_participation_id: string
        }
        Returns: undefined
      }
      can_create_work: {
        Args: { authorizing_organization_id: string }
        Returns: boolean
      }
      can_manage_work: { Args: { target_work_id: string }; Returns: boolean }
      can_view_work: { Args: { target_work_id: string }; Returns: boolean }
      change_organization_membership: {
        Args: {
          p_is_admin: boolean
          p_membership_id: string
          p_membership_type: Database["public"]["Enums"]["organization_membership_type"]
          p_organization_id: string
          p_remove?: boolean
        }
        Returns: undefined
      }
      create_organization: {
        Args: { p_organization_name: string }
        Returns: {
          membership_id: string
          organization_id: string
          organization_name: string
        }[]
      }
      create_organization_invitation: {
        Args: {
          p_email: string
          p_is_admin?: boolean
          p_membership_type: Database["public"]["Enums"]["organization_membership_type"]
          p_organization_id: string
        }
        Returns: {
          invitation_id: string
          token: string
        }[]
      }
      create_work: {
        Args: {
          p_authorizing_organization_id: string
          p_ends_at: string
          p_organizer_organization_id?: string
          p_organizer_person_id?: string
          p_starts_at: string
          p_timezone: string
          p_title: string
          p_work_type: string
        }
        Returns: string
      }
      create_work_block: {
        Args: {
          p_block_type: string
          p_ends_at: string
          p_label: string
          p_starts_at: string
          p_work_id: string
        }
        Returns: string
      }
      current_person_has_organization: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      current_person_id: { Args: never; Returns: string }
      current_person_organizations: {
        Args: never
        Returns: {
          is_admin: boolean
          membership_id: string
          membership_type: Database["public"]["Enums"]["organization_membership_type"]
          organization_id: string
          organization_name: string
        }[]
      }
      delete_work_block: {
        Args: { p_work_block_id: string; p_work_id: string }
        Returns: undefined
      }
      is_organization_admin: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_work_participant: {
        Args: { target_work_id: string }
        Returns: boolean
      }
      remove_work_participant: {
        Args: { p_work_id: string; p_work_participation_id: string }
        Returns: undefined
      }
      remove_work_participation_function: {
        Args: {
          p_function_id: string
          p_work_id: string
          p_work_participation_id: string
        }
        Returns: undefined
      }
      revoke_organization_invitation: {
        Args: { p_invitation_id: string; p_organization_id: string }
        Returns: undefined
      }
      unassign_work_participant_from_block: {
        Args: {
          p_work_block_id: string
          p_work_id: string
          p_work_participation_id: string
        }
        Returns: undefined
      }
      update_work: {
        Args: {
          p_ends_at: string
          p_organizer_organization_id?: string
          p_organizer_person_id?: string
          p_starts_at: string
          p_status: string
          p_timezone: string
          p_title: string
          p_work_id: string
          p_work_type: string
        }
        Returns: undefined
      }
      update_work_block: {
        Args: {
          p_block_type: string
          p_ends_at: string
          p_label: string
          p_starts_at: string
          p_work_block_id: string
          p_work_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      organization_membership_type: "member" | "freelancer"
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
    Enums: {
      organization_membership_type: ["member", "freelancer"],
    },
  },
} as const
