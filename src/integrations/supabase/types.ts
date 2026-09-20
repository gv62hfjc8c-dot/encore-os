export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      organization_memberships: {
        Row: {
          created_at: string;
          id: string;
          is_admin: boolean;
          membership_type: Database["public"]["Enums"]["organization_membership_type"];
          organization_id: string;
          person_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          membership_type: Database["public"]["Enums"]["organization_membership_type"];
          organization_id: string;
          person_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_admin?: boolean;
          membership_type?: Database["public"]["Enums"]["organization_membership_type"];
          organization_id?: string;
          person_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_memberships_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "persons";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      persons: {
        Row: {
          auth_user_id: string;
          created_at: string;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string;
        };
        Insert: {
          auth_user_id: string;
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
        };
        Update: {
          auth_user_id?: string;
          created_at?: string;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      active_organization_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      create_organization_invitation: {
        Args: {
          p_organization_id: string;
          p_email: string;
          p_membership_type: "member" | "freelancer";
          p_is_admin: boolean;
        };
        Returns: { invitation_id: string; token: string }[];
      };
      accept_organization_invitation: {
        Args: { p_token: string };
        Returns: string;
      };
      revoke_organization_invitation: {
        Args: { p_organization_id: string; p_invitation_id: string };
        Returns: undefined;
      };
      change_organization_membership: {
        Args: {
          p_organization_id: string;
          p_membership_id: string;
          p_membership_type: "member" | "freelancer";
          p_is_admin: boolean;
          p_remove: boolean;
        };
        Returns: undefined;
      };
      create_organization: {
        Args: { p_organization_name: string };
        Returns: {
          membership_id: string;
          organization_id: string;
          organization_name: string;
        }[];
      };
      current_person_id: { Args: never; Returns: string };
      current_person_organizations: {
        Args: never;
        Returns: {
          is_admin: boolean;
          membership_id: string;
          membership_type: Database["public"]["Enums"]["organization_membership_type"];
          organization_id: string;
          organization_name: string;
        }[];
      };
      is_organization_admin: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      is_organization_member: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      organization_membership_type: "member" | "freelancer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      organization_membership_type: ["member", "freelancer"],
    },
  },
} as const;
