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
      admin_requests: {
        Row: {
          approval_token: string
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          reason: string | null
          requester_email: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_token?: string
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
          requester_email: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_token?: string
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          reason?: string | null
          requester_email?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          att_date: string
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          owner_id: string
          status: string
        }
        Insert: {
          att_date?: string
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          owner_id: string
          status: string
        }
        Update: {
          att_date?: string
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          owner_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          opening_balance: number
          owner_id: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          opening_balance?: number
          owner_id: string
          type: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          opening_balance?: number
          owner_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          aadhar: string | null
          allowances: number
          bank_account: string | null
          bank_name: string | null
          basic_salary: number
          created_at: string
          date_of_joining: string
          department: string | null
          designation: string | null
          email: string | null
          employee_code: string
          esic_number: string | null
          full_name: string
          hra: number
          id: string
          ifsc: string | null
          owner_id: string
          pan: string | null
          pf_number: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          aadhar?: string | null
          allowances?: number
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number
          created_at?: string
          date_of_joining?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_code: string
          esic_number?: string | null
          full_name: string
          hra?: number
          id?: string
          ifsc?: string | null
          owner_id: string
          pan?: string | null
          pf_number?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          aadhar?: string | null
          allowances?: number
          bank_account?: string | null
          bank_name?: string | null
          basic_salary?: number
          created_at?: string
          date_of_joining?: string
          department?: string | null
          designation?: string | null
          email?: string | null
          employee_code?: string
          esic_number?: string | null
          full_name?: string
          hra?: number
          id?: string
          ifsc?: string | null
          owner_id?: string
          pan?: string | null
          pf_number?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          hsn_sac: string | null
          id: string
          invoice_id: string
          owner_id: string
          qty: number
          rate: number
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          hsn_sac?: string | null
          id?: string
          invoice_id: string
          owner_id: string
          qty?: number
          rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          hsn_sac?: string | null
          id?: string
          invoice_id?: string
          owner_id?: string
          qty?: number
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          cgst: number
          created_at: string
          due_date: string | null
          gst_rate: number
          id: string
          igst: number
          invoice_date: string
          invoice_no: string
          is_interstate: boolean
          notes: string | null
          owner_id: string
          party_id: string | null
          party_snapshot: Json | null
          sgst: number
          share_email_sent_at: string | null
          share_whatsapp_sent_at: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          cgst?: number
          created_at?: string
          due_date?: string | null
          gst_rate?: number
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no: string
          is_interstate?: boolean
          notes?: string | null
          owner_id: string
          party_id?: string | null
          party_snapshot?: Json | null
          sgst?: number
          share_email_sent_at?: string | null
          share_whatsapp_sent_at?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          cgst?: number
          created_at?: string
          due_date?: string | null
          gst_rate?: number
          id?: string
          igst?: number
          invoice_date?: string
          invoice_no?: string
          is_interstate?: boolean
          notes?: string | null
          owner_id?: string
          party_id?: string | null
          party_snapshot?: Json | null
          sgst?: number
          share_email_sent_at?: string | null
          share_whatsapp_sent_at?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          created_at: string
          entry_date: string
          entry_no: string
          id: string
          narration: string | null
          owner_id: string
          total_credit: number
          total_debit: number
        }
        Insert: {
          created_at?: string
          entry_date?: string
          entry_no: string
          id?: string
          narration?: string | null
          owner_id: string
          total_credit?: number
          total_debit?: number
        }
        Update: {
          created_at?: string
          entry_date?: string
          entry_no?: string
          id?: string
          narration?: string | null
          owner_id?: string
          total_credit?: number
          total_debit?: number
        }
        Relationships: []
      }
      journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          entry_id: string
          id: string
          owner_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id: string
          id?: string
          owner_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id?: string
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          billing_address: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          name: string
          owner_id: string
          pan: string | null
          phone: string | null
          place_of_supply: string | null
          state: string | null
          state_code: string | null
          type: string
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name: string
          owner_id: string
          pan?: string | null
          phone?: string | null
          place_of_supply?: string | null
          state?: string | null
          state_code?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          name?: string
          owner_id?: string
          pan?: string | null
          phone?: string | null
          place_of_supply?: string | null
          state?: string | null
          state_code?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          billing_cycle: string
          company_name: string | null
          created_at: string
          currency: string
          email: string
          full_name: string | null
          gstin: string | null
          id: string
          notes: string | null
          payment_method: string | null
          phone: string | null
          plan: string
          screenshot_url: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          upi_ref: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          company_name?: string | null
          created_at?: string
          currency?: string
          email: string
          full_name?: string | null
          gstin?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          plan: string
          screenshot_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          upi_ref?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          company_name?: string | null
          created_at?: string
          currency?: string
          email?: string
          full_name?: string | null
          gstin?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          plan?: string
          screenshot_url?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          upi_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payroll_runs: {
        Row: {
          created_at: string
          days_present: number
          employee_id: string
          esic_deduction: number
          gross_pay: number
          id: string
          net_pay: number
          other_deductions: number
          owner_id: string
          period_month: number
          period_year: number
          pf_deduction: number
          status: string
          tds_deduction: number
        }
        Insert: {
          created_at?: string
          days_present?: number
          employee_id: string
          esic_deduction?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          other_deductions?: number
          owner_id: string
          period_month: number
          period_year: number
          pf_deduction?: number
          status?: string
          tds_deduction?: number
        }
        Update: {
          created_at?: string
          days_present?: number
          employee_id?: string
          esic_deduction?: number
          gross_pay?: number
          id?: string
          net_pay?: number
          other_deductions?: number
          owner_id?: string
          period_month?: number
          period_year?: number
          pf_deduction?: number
          status?: string
          tds_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          approved: boolean
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          payment_status: string
          phone: string | null
          referred_by: string | null
          seller_address: string | null
          seller_email: string | null
          seller_gstin: string | null
          seller_logo_url: string | null
          seller_name: string | null
          seller_pan: string | null
          seller_phone: string | null
          seller_state: string | null
          seller_state_code: string | null
          trial_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          approved?: boolean
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          payment_status?: string
          phone?: string | null
          referred_by?: string | null
          seller_address?: string | null
          seller_email?: string | null
          seller_gstin?: string | null
          seller_logo_url?: string | null
          seller_name?: string | null
          seller_pan?: string | null
          seller_phone?: string | null
          seller_state?: string | null
          seller_state_code?: string | null
          trial_expires_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          approved?: boolean
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          payment_status?: string
          phone?: string | null
          referred_by?: string | null
          seller_address?: string | null
          seller_email?: string | null
          seller_gstin?: string | null
          seller_logo_url?: string | null
          seller_name?: string | null
          seller_pan?: string | null
          seller_phone?: string | null
          seller_state?: string | null
          seller_state_code?: string | null
          trial_expires_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          employee_name: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          employee_name: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          employee_name?: string
          id?: string
          notes?: string | null
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
      approve_admin_request: {
        Args: { _reviewer: string; _token: string }
        Returns: {
          approval_token: string
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          reason: string | null
          requester_email: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_admin_request: {
        Args: { _reviewer: string; _token: string }
        Returns: {
          approval_token: string
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          reason: string | null
          requester_email: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "member" | "trial"
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
      app_role: ["admin", "member", "trial"],
    },
  },
} as const
