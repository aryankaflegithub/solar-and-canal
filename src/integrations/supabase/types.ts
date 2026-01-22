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
      maintenance_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          issue_type: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          station_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          issue_type: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          station_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          issue_type?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "solar_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      override_commands: {
        Row: {
          command_type: string
          created_at: string
          executed_at: string | null
          executed_by: string | null
          id: string
          parameters: Json | null
          station_id: string
          status: string | null
        }
        Insert: {
          command_type: string
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          parameters?: Json | null
          station_id: string
          status?: string | null
        }
        Update: {
          command_type?: string
          created_at?: string
          executed_at?: string | null
          executed_by?: string | null
          id?: string
          parameters?: Json | null
          station_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "override_commands_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "solar_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      solar_stations: {
        Row: {
          canal_segment: string
          capacity_kw: number
          created_at: string
          id: string
          installation_date: string | null
          latitude: number
          longitude: number
          name: string
          panel_count: number
          status: string | null
        }
        Insert: {
          canal_segment: string
          capacity_kw: number
          created_at?: string
          id?: string
          installation_date?: string | null
          latitude: number
          longitude: number
          name: string
          panel_count?: number
          status?: string | null
        }
        Update: {
          canal_segment?: string
          capacity_kw?: number
          created_at?: string
          id?: string
          installation_date?: string | null
          latitude?: number
          longitude?: number
          name?: string
          panel_count?: number
          status?: string | null
        }
        Relationships: []
      }
      telemetry_data: {
        Row: {
          humidity_percent: number | null
          id: string
          power_output_kw: number | null
          recorded_at: string
          silt_level: number | null
          solar_irradiance: number | null
          station_id: string
          temperature_ambient: number | null
          temperature_panel: number | null
          water_temp: number | null
        }
        Insert: {
          humidity_percent?: number | null
          id?: string
          power_output_kw?: number | null
          recorded_at?: string
          silt_level?: number | null
          solar_irradiance?: number | null
          station_id: string
          temperature_ambient?: number | null
          temperature_panel?: number | null
          water_temp?: number | null
        }
        Update: {
          humidity_percent?: number | null
          id?: string
          power_output_kw?: number | null
          recorded_at?: string
          silt_level?: number | null
          solar_irradiance?: number | null
          station_id?: string
          temperature_ambient?: number | null
          temperature_panel?: number | null
          water_temp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_data_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "solar_stations"
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
