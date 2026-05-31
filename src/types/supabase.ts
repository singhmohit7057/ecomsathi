// ============================================================
// EcomSathi — Supabase Database Types
// Auto-structured for use with `createClient<Database>()`
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // --------------------------------------------------
      // profiles
      // --------------------------------------------------
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          org_id: string | null;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          subscription_status: 'free' | 'trial' | 'pro' | 'enterprise';
          subscription_expires_at: string | null;
          gstin: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          subscription_status?: 'free' | 'trial' | 'pro' | 'enterprise';
          subscription_expires_at?: string | null;
          gstin?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          subscription_status?: 'free' | 'trial' | 'pro' | 'enterprise';
          subscription_expires_at?: string | null;
          gstin?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // organizations
      // --------------------------------------------------
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          subscription_status: string;
          gstin: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          subscription_status?: string;
          gstin?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          subscription_status?: string;
          gstin?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // products
      // --------------------------------------------------
      products: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          category: string | null;
          brand: string | null;
          hsn_code: string | null;
          gst_rate: number;
          mrp: number | null;
          cost_price: number | null;
          selling_price: number | null;
          images: string[];
          tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          brand?: string | null;
          hsn_code?: string | null;
          gst_rate?: number;
          mrp?: number | null;
          cost_price?: number | null;
          selling_price?: number | null;
          images?: string[];
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          brand?: string | null;
          hsn_code?: string | null;
          gst_rate?: number;
          mrp?: number | null;
          cost_price?: number | null;
          selling_price?: number | null;
          images?: string[];
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // product_variants
      // --------------------------------------------------
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          barcode: string | null;
          name: string;
          attributes: Json;
          mrp: number | null;
          cost_price: number | null;
          selling_price: number | null;
          weight_grams: number | null;
          dimensions: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku: string;
          barcode?: string | null;
          name: string;
          attributes?: Json;
          mrp?: number | null;
          cost_price?: number | null;
          selling_price?: number | null;
          weight_grams?: number | null;
          dimensions?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string;
          barcode?: string | null;
          name?: string;
          attributes?: Json;
          mrp?: number | null;
          cost_price?: number | null;
          selling_price?: number | null;
          weight_grams?: number | null;
          dimensions?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // warehouses
      // --------------------------------------------------
      warehouses: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          code: string;
          address: string | null;
          city: string | null;
          state: string | null;
          pincode: string | null;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          code: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          pincode?: string | null;
          is_active?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // inventory
      // --------------------------------------------------
      inventory: {
        Row: {
          id: string;
          org_id: string;
          variant_id: string;
          warehouse_id: string;
          quantity: number;
          reserved_quantity: number;
          low_stock_threshold: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          variant_id: string;
          warehouse_id: string;
          quantity?: number;
          reserved_quantity?: number;
          low_stock_threshold?: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          variant_id?: string;
          warehouse_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          low_stock_threshold?: number;
          last_updated?: string;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // stock_movements
      // --------------------------------------------------
      stock_movements: {
        Row: {
          id: string;
          org_id: string;
          variant_id: string;
          warehouse_id: string;
          movement_type:
            | 'purchase'
            | 'sale'
            | 'return'
            | 'transfer'
            | 'adjustment'
            | 'write_off'
            | 'initial';
          quantity: number;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          variant_id: string;
          warehouse_id: string;
          movement_type:
            | 'purchase'
            | 'sale'
            | 'return'
            | 'transfer'
            | 'adjustment'
            | 'write_off'
            | 'initial';
          quantity: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          variant_id?: string;
          warehouse_id?: string;
          movement_type?:
            | 'purchase'
            | 'sale'
            | 'return'
            | 'transfer'
            | 'adjustment'
            | 'write_off'
            | 'initial';
          quantity?: number;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // purchase_orders
      // --------------------------------------------------
      purchase_orders: {
        Row: {
          id: string;
          org_id: string;
          po_number: string;
          supplier_name: string | null;
          supplier_gstin: string | null;
          warehouse_id: string;
          status: 'draft' | 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
          total_amount: number;
          expected_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          po_number: string;
          supplier_name?: string | null;
          supplier_gstin?: string | null;
          warehouse_id: string;
          status?: 'draft' | 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
          total_amount?: number;
          expected_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          po_number?: string;
          supplier_name?: string | null;
          supplier_gstin?: string | null;
          warehouse_id?: string;
          status?: 'draft' | 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
          total_amount?: number;
          expected_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // purchase_order_items  (bonus: referenced by PurchaseOrderItem)
      // --------------------------------------------------
      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          variant_id: string;
          quantity_ordered: number;
          quantity_received: number;
          unit_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          po_id: string;
          variant_id: string;
          quantity_ordered: number;
          quantity_received?: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          po_id?: string;
          variant_id?: string;
          quantity_ordered?: number;
          quantity_received?: number;
          unit_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // marketplaces
      // --------------------------------------------------
      marketplaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // orders
      // --------------------------------------------------
      orders: {
        Row: {
          id: string;
          org_id: string;
          marketplace_id: string;
          order_id: string;
          order_date: string;
          status: string;
          total_amount: number;
          settlement_amount: number | null;
          marketplace_fee: number | null;
          gst_amount: number | null;
          shipping_amount: number | null;
          sku: string | null;
          raw_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          marketplace_id: string;
          order_id: string;
          order_date: string;
          status?: string;
          total_amount?: number;
          settlement_amount?: number | null;
          marketplace_fee?: number | null;
          gst_amount?: number | null;
          shipping_amount?: number | null;
          sku?: string | null;
          raw_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          marketplace_id?: string;
          order_id?: string;
          order_date?: string;
          status?: string;
          total_amount?: number;
          settlement_amount?: number | null;
          marketplace_fee?: number | null;
          gst_amount?: number | null;
          shipping_amount?: number | null;
          sku?: string | null;
          raw_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // settlements
      // --------------------------------------------------
      settlements: {
        Row: {
          id: string;
          org_id: string;
          marketplace_id: string;
          settlement_id: string | null;
          settlement_date: string;
          amount: number;
          status: 'pending' | 'matched' | 'unmatched' | 'disputed';
          order_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          marketplace_id: string;
          settlement_id?: string | null;
          settlement_date: string;
          amount: number;
          status?: 'pending' | 'matched' | 'unmatched' | 'disputed';
          order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          marketplace_id?: string;
          settlement_id?: string | null;
          settlement_date?: string;
          amount?: number;
          status?: 'pending' | 'matched' | 'unmatched' | 'disputed';
          order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // reconciliation_reports
      // --------------------------------------------------
      reconciliation_reports: {
        Row: {
          id: string;
          org_id: string;
          marketplace_id: string;
          report_type: 'orders' | 'settlements' | 'returns' | 'refunds';
          date_from: string;
          date_to: string;
          total_orders: number;
          matched_orders: number;
          unmatched_orders: number;
          total_revenue: number;
          total_fees: number;
          discrepancy_amount: number;
          status: 'processing' | 'completed' | 'failed';
          file_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          marketplace_id: string;
          report_type: 'orders' | 'settlements' | 'returns' | 'refunds';
          date_from: string;
          date_to: string;
          total_orders?: number;
          matched_orders?: number;
          unmatched_orders?: number;
          total_revenue?: number;
          total_fees?: number;
          discrepancy_amount?: number;
          status?: 'processing' | 'completed' | 'failed';
          file_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          marketplace_id?: string;
          report_type?: 'orders' | 'settlements' | 'returns' | 'refunds';
          date_from?: string;
          date_to?: string;
          total_orders?: number;
          matched_orders?: number;
          unmatched_orders?: number;
          total_revenue?: number;
          total_fees?: number;
          discrepancy_amount?: number;
          status?: 'processing' | 'completed' | 'failed';
          file_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // subscriptions
      // --------------------------------------------------
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          plan: 'free' | 'trial' | 'pro' | 'enterprise';
          status: 'active' | 'cancelled' | 'expired' | 'past_due';
          starts_at: string;
          expires_at: string | null;
          payment_gateway: string | null;
          payment_reference: string | null;
          amount: number | null;
          currency: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          plan?: 'free' | 'trial' | 'pro' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired' | 'past_due';
          starts_at?: string;
          expires_at?: string | null;
          payment_gateway?: string | null;
          payment_reference?: string | null;
          amount?: number | null;
          currency?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          plan?: 'free' | 'trial' | 'pro' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired' | 'past_due';
          starts_at?: string;
          expires_at?: string | null;
          payment_gateway?: string | null;
          payment_reference?: string | null;
          amount?: number | null;
          currency?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // tool_usage_logs
      // --------------------------------------------------
      tool_usage_logs: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          tool_name: string;
          action: string;
          input_summary: string | null;
          result_summary: string | null;
          duration_ms: number | null;
          success: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          tool_name: string;
          action: string;
          input_summary?: string | null;
          result_summary?: string | null;
          duration_ms?: number | null;
          success?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          tool_name?: string;
          action?: string;
          input_summary?: string | null;
          result_summary?: string | null;
          duration_ms?: number | null;
          success?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // uploaded_files
      // --------------------------------------------------
      uploaded_files: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          storage_path: string;
          public_url: string | null;
          purpose: string | null;
          processing_status: 'pending' | 'processing' | 'done' | 'failed';
          processing_result: Json | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          filename: string;
          original_name: string;
          mime_type: string;
          size_bytes: number;
          storage_path: string;
          public_url?: string | null;
          purpose?: string | null;
          processing_status?: 'pending' | 'processing' | 'done' | 'failed';
          processing_result?: Json | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          filename?: string;
          original_name?: string;
          mime_type?: string;
          size_bytes?: number;
          storage_path?: string;
          public_url?: string | null;
          purpose?: string | null;
          processing_status?: 'pending' | 'processing' | 'done' | 'failed';
          processing_result?: Json | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // --------------------------------------------------
      // activity_logs
      // --------------------------------------------------
      activity_logs: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          description: string | null;
          old_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          description?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          description?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      // --------------------------------------------------
      // org_members
      // --------------------------------------------------
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by: string | null;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by?: string | null;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          invited_by?: string | null;
          joined_at?: string;
          created_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      user_role: 'owner' | 'admin' | 'member' | 'viewer';
      subscription_plan: 'free' | 'trial' | 'pro' | 'enterprise';
      movement_type:
        | 'purchase'
        | 'sale'
        | 'return'
        | 'transfer'
        | 'adjustment'
        | 'write_off'
        | 'initial';
      po_status: 'draft' | 'pending' | 'approved' | 'received' | 'partial' | 'cancelled';
      settlement_status: 'pending' | 'matched' | 'unmatched' | 'disputed';
      report_status: 'processing' | 'completed' | 'failed';
      report_type: 'orders' | 'settlements' | 'returns' | 'refunds';
      processing_status: 'pending' | 'processing' | 'done' | 'failed';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// -------------------------------------------------------
// Convenience re-exports for common row types
// -------------------------------------------------------

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
