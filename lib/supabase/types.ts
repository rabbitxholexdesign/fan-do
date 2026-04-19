export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "fan" | "operator" | "admin"
export type TalentCategory = "hito" | "mono" | "koto"
export type TalentStatus =
  | "draft"
  | "pending_review"
  | "pending_kyc"
  | "pending_final"
  | "active"
  | "suspended"
  | "rejected"
export type KycType = "individual" | "corporate" | "organization"
export type KycStatus = "pending" | "approved" | "rejected" | "requires_resubmission"
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "paused"
export type BillingCycle = "monthly" | "yearly"
export type FancEventType =
  | "subscription"
  | "sns_share"
  | "event_participation"
  | "community_activity"
  | "bonus"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          display_name: string | null
          avatar_url: string | null
          prefecture: string | null
          bio: string | null
          fanc_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          prefecture?: string | null
          bio?: string | null
          fanc_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          display_name?: string | null
          avatar_url?: string | null
          prefecture?: string | null
          bio?: string | null
          fanc_score?: number
          updated_at?: string
        }
      }
      talents: {
        Row: {
          id: string
          operator_id: string
          name: string
          slug: string
          category: TalentCategory
          tags: string[]
          prefecture: string | null
          city: string | null
          description: string | null
          cover_image_url: string | null
          avatar_url: string | null
          status: TalentStatus
          fanc_score: number
          supporter_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          operator_id: string
          name: string
          slug: string
          category: TalentCategory
          tags?: string[]
          prefecture?: string | null
          city?: string | null
          description?: string | null
          cover_image_url?: string | null
          avatar_url?: string | null
          status?: TalentStatus
          fanc_score?: number
          supporter_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          operator_id?: string
          name?: string
          slug?: string
          category?: TalentCategory
          tags?: string[]
          prefecture?: string | null
          city?: string | null
          description?: string | null
          cover_image_url?: string | null
          avatar_url?: string | null
          status?: TalentStatus
          fanc_score?: number
          supporter_count?: number
          updated_at?: string
          published_at?: string | null
        }
      }
      kyc_submissions: {
        Row: {
          id: string
          talent_id: string
          kyc_type: KycType
          status: KycStatus
          document_urls: Json
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          talent_id: string
          kyc_type: KycType
          status?: KycStatus
          document_urls?: Json
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          kyc_type?: KycType
          status?: KycStatus
          document_urls?: Json
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          updated_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          talent_id: string
          bank_name: string
          branch_name: string
          account_type: string
          account_number: string
          account_holder: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          talent_id: string
          bank_name: string
          branch_name: string
          account_type: string
          account_number: string
          account_holder: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          bank_name?: string
          branch_name?: string
          account_type?: string
          account_number?: string
          account_holder?: string
          is_verified?: boolean
          updated_at?: string
        }
      }
      legal_notices: {
        Row: {
          id: string
          talent_id: string
          seller_name: string
          representative_name: string | null
          address: string
          phone: string
          email: string
          payment_methods: string
          billing_timing: string
          delivery_timing: string
          cancel_policy: string
          environment: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          talent_id: string
          seller_name: string
          representative_name?: string | null
          address: string
          phone: string
          email: string
          payment_methods: string
          billing_timing: string
          delivery_timing: string
          cancel_policy: string
          environment?: string | null
          updated_at?: string
        }
        Update: {
          seller_name?: string
          representative_name?: string | null
          address?: string
          phone?: string
          email?: string
          payment_methods?: string
          billing_timing?: string
          delivery_timing?: string
          cancel_policy?: string
          environment?: string | null
          updated_at?: string
        }
      }
      support_plans: {
        Row: {
          id: string
          talent_id: string
          name: string
          description: string | null
          price: number
          billing_cycle: BillingCycle
          fanc_bonus: number
          benefits: Json
          is_active: boolean
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          talent_id: string
          name: string
          description?: string | null
          price: number
          billing_cycle?: BillingCycle
          fanc_bonus?: number
          benefits?: Json
          is_active?: boolean
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number
          billing_cycle?: BillingCycle
          fanc_bonus?: number
          benefits?: Json
          is_active?: boolean
          stripe_price_id?: string | null
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          fan_id: string
          talent_id: string
          plan_id: string
          status: SubscriptionStatus
          stripe_subscription_id: string | null
          current_period_start: string
          current_period_end: string
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fan_id: string
          talent_id: string
          plan_id: string
          status?: SubscriptionStatus
          stripe_subscription_id?: string | null
          current_period_start: string
          current_period_end: string
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: SubscriptionStatus
          stripe_subscription_id?: string | null
          current_period_start?: string
          current_period_end?: string
          cancelled_at?: string | null
          updated_at?: string
        }
      }
      fanc_history: {
        Row: {
          id: string
          user_id: string
          talent_id: string | null
          event_type: FancEventType
          points: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          talent_id?: string | null
          event_type: FancEventType
          points: number
          description?: string | null
          created_at?: string
        }
        Update: never
      }
      community_posts: {
        Row: {
          id: string
          talent_id: string
          author_id: string
          content: string
          image_urls: string[]
          is_pinned: boolean
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          talent_id: string
          author_id: string
          content: string
          image_urls?: string[]
          is_pinned?: boolean
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string
          image_urls?: string[]
          is_pinned?: boolean
          like_count?: number
          comment_count?: number
          updated_at?: string
        }
      }
      admin_audit_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          before_state: Json | null
          after_state: Json | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type: string
          target_id: string
          before_state?: Json | null
          after_state?: Json | null
          note?: string | null
          created_at?: string
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      talent_category: TalentCategory
      talent_status: TalentStatus
      kyc_type: KycType
      kyc_status: KycStatus
      subscription_status: SubscriptionStatus
      billing_cycle: BillingCycle
      fanc_event_type: FancEventType
    }
  }
}
