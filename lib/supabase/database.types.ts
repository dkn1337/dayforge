export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; timezone: string; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string; avatar_url?: string | null; timezone?: string; created_at?: string; updated_at?: string };
        Update: { display_name?: string; avatar_url?: string | null; timezone?: string; updated_at?: string };
        Relationships: [];
      };
      workspace_members: {
        Row: { workspace_id: string; user_id: string; role: "owner" | "member"; created_at: string };
        Insert: { workspace_id: string; user_id: string; role?: "owner" | "member"; created_at?: string };
        Update: { role?: "owner" | "member" };
        Relationships: [];
      };
      workspace_state_snapshots: {
        Row: { workspace_id: string; state: Json; updated_at: string; updated_by: string };
        Insert: { workspace_id: string; state: Json; updated_at?: string; updated_by?: string };
        Update: { state?: Json; updated_at?: string; updated_by?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_personal_workspace: { Args: Record<string, never>; Returns: string };
    };
    Enums: {
      workspace_role: "owner" | "member";
    };
    CompositeTypes: Record<string, never>;
  };
};
