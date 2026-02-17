export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          category: string
          subcategory: string | null
          images: string[]
          video_url: string | null
          rating: number
          review_count: number
          stock: number
          tags: string[]
          created_at: string
          featured: boolean
          bestseller: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          category: string
          subcategory?: string | null
          images?: string[]
          video_url?: string | null
          rating?: number
          review_count?: number
          stock?: number
          tags?: string[]
          created_at?: string
          featured?: boolean
          bestseller?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          category?: string
          subcategory?: string | null
          images?: string[]
          video_url?: string | null
          rating?: number
          review_count?: number
          stock?: number
          tags?: string[]
          created_at?: string
          featured?: boolean
          bestseller?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          user_name: string | null
          rating: number | null
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          user_name?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          user_name?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          subtotal: number
          shipping: number
          tax: number
          total: number
          shipping_address: Json | null
          payment_method: string | null
          payment_details: Json | null
          created_at: string
          estimated_delivery: string | null
          tracking_steps: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          subtotal?: number
          shipping?: number
          tax?: number
          total?: number
          shipping_address?: Json | null
          payment_method?: string | null
          payment_details?: Json | null
          created_at?: string
          estimated_delivery?: string | null
          tracking_steps?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          subtotal?: number
          shipping?: number
          tax?: number
          total?: number
          shipping_address?: Json | null
          payment_method?: string | null
          payment_details?: Json | null
          created_at?: string
          estimated_delivery?: string | null
          tracking_steps?: Json | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price_at_purchase: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          price_at_purchase: number
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
        }
      }
      transactions: {
        Row: {
          id: string
          order_id: string | null
          user_id: string | null
          payment_mode: string | null
          amount: number
          status: string
          timestamp: string
          receipt_url: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          user_id?: string | null
          payment_mode?: string | null
          amount: number
          status?: string
          timestamp?: string
          receipt_url?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          user_id?: string | null
          payment_mode?: string | null
          amount?: number
          status?: string
          timestamp?: string
          receipt_url?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          body: string
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          body: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          body?: string
          read?: boolean
          data?: Json | null
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          created_at?: string
        }
      }
      browsing_history: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          viewed_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_type: string
          discount_value: number
          min_purchase_amount: number | null
          start_date: string | null
          end_date: string | null
          usage_limit: number | null
          used_count: number | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          discount_type: string
          discount_value: number
          min_purchase_amount?: number | null
          start_date?: string | null
          end_date?: string | null
          usage_limit?: number | null
          used_count?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          discount_type?: string
          discount_value?: number
          min_purchase_amount?: number | null
          start_date?: string | null
          end_date?: string | null
          usage_limit?: number | null
          used_count?: number | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][PublicEnumNameOrOptions]
  : never
