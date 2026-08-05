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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_runs: {
        Row: {
          cost_usd: number | null
          created_at: string
          id: string
          input_tokens: number | null
          model: string | null
          organization_id: string
          output_tokens: number | null
          payload_in: Json | null
          payload_out: Json | null
          purpose: string
          related_post_id: string | null
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          organization_id: string
          output_tokens?: number | null
          payload_in?: Json | null
          payload_out?: Json | null
          purpose: string
          related_post_id?: string | null
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_tokens?: number | null
          model?: string | null
          organization_id?: string
          output_tokens?: number | null
          payload_in?: Json | null
          payload_out?: Json | null
          purpose?: string
          related_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_runs_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          body: string | null
          created_at: string
          handle: string | null
          id: string
          kind: string
          organization_id: string
          payload: Json
          seen: boolean
          severity: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          kind: string
          organization_id: string
          payload?: Json
          seen?: boolean
          severity?: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          handle?: string | null
          id?: string
          kind?: string
          organization_id?: string
          payload?: Json
          seen?: boolean
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          created_at: string
          decision: string
          id: string
          note: string | null
          post_id: string
          reviewer_id: string | null
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          note?: string | null
          post_id: string
          reviewer_id?: string | null
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          note?: string | null
          post_id?: string
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_notes: {
        Row: {
          analyzed_at: string
          comment_count: number | null
          id: string
          objections: Json | null
          organization_id: string
          post_id: string
          questions: Json | null
          sentiment: string | null
          summary: string | null
          themes: Json | null
        }
        Insert: {
          analyzed_at?: string
          comment_count?: number | null
          id?: string
          objections?: Json | null
          organization_id: string
          post_id: string
          questions?: Json | null
          sentiment?: string | null
          summary?: string | null
          themes?: Json | null
        }
        Update: {
          analyzed_at?: string
          comment_count?: number | null
          id?: string
          objections?: Json | null
          organization_id?: string
          post_id?: string
          questions?: Json | null
          sentiment?: string | null
          summary?: string | null
          themes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audience_notes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          audience: string | null
          created_at: string
          dos_and_donts: Json | null
          guidelines: string | null
          id: string
          name: string
          organization_id: string
          playbook: string | null
          updated_at: string
          voice: string | null
        }
        Insert: {
          audience?: string | null
          created_at?: string
          dos_and_donts?: Json | null
          guidelines?: string | null
          id?: string
          name: string
          organization_id: string
          playbook?: string | null
          updated_at?: string
          voice?: string | null
        }
        Update: {
          audience?: string | null
          created_at?: string
          dos_and_donts?: Json | null
          guidelines?: string | null
          id?: string
          name?: string
          organization_id?: string
          playbook?: string | null
          updated_at?: string
          voice?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_posts: {
        Row: {
          caption: string | null
          captured_at: string
          comments: number | null
          competitor_id: string
          format: Database["public"]["Enums"]["post_format"] | null
          id: string
          likes: number | null
          raw: Json | null
          source: string
          url: string | null
          views: number | null
        }
        Insert: {
          caption?: string | null
          captured_at?: string
          comments?: number | null
          competitor_id: string
          format?: Database["public"]["Enums"]["post_format"] | null
          id?: string
          likes?: number | null
          raw?: Json | null
          source?: string
          url?: string | null
          views?: number | null
        }
        Update: {
          caption?: string | null
          captured_at?: string
          comments?: number | null
          competitor_id?: string
          format?: Database["public"]["Enums"]["post_format"] | null
          id?: string
          likes?: number | null
          raw?: Json | null
          source?: string
          url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_posts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          channel: Database["public"]["Enums"]["social_channel"]
          created_at: string
          handle: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["social_channel"]
          created_at?: string
          handle?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["social_channel"]
          created_at?: string
          handle?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pillars: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pillars_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      follower_history: {
        Row: {
          captured_at: string
          dia: string
          followers: number
          handle: string
          id: string
          organization_id: string
        }
        Insert: {
          captured_at?: string
          dia?: string
          followers: number
          handle: string
          id?: string
          organization_id: string
        }
        Update: {
          captured_at?: string
          dia?: string
          followers?: number
          handle?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follower_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          baseline: number | null
          created_at: string
          created_by: string | null
          end_date: string
          handle: string | null
          id: string
          label: string | null
          metric: string
          mode: string
          organization_id: string
          start_date: string
          target: number
          updated_at: string
        }
        Insert: {
          baseline?: number | null
          created_at?: string
          created_by?: string | null
          end_date: string
          handle?: string | null
          id?: string
          label?: string | null
          metric: string
          mode?: string
          organization_id: string
          start_date: string
          target: number
          updated_at?: string
        }
        Update: {
          baseline?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          handle?: string | null
          id?: string
          label?: string | null
          metric?: string
          mode?: string
          organization_id?: string
          start_date?: string
          target?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          angle: string | null
          based_on: string | null
          created_at: string
          format: string | null
          handle: string | null
          hook_type: string | null
          id: string
          organization_id: string
          pillar: string | null
          rationale: string | null
          status: string
          tipo: string
          title: string
        }
        Insert: {
          angle?: string | null
          based_on?: string | null
          created_at?: string
          format?: string | null
          handle?: string | null
          hook_type?: string | null
          id?: string
          organization_id: string
          pillar?: string | null
          rationale?: string | null
          status?: string
          tipo?: string
          title: string
        }
        Update: {
          angle?: string | null
          based_on?: string | null
          created_at?: string
          format?: string | null
          handle?: string | null
          hook_type?: string | null
          id?: string
          organization_id?: string
          pillar?: string | null
          rationale?: string | null
          status?: string
          tipo?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          evidence: Json | null
          first_seen_at: string
          id: string
          last_confirmed_at: string
          organization_id: string
          scope: Json | null
          statement: string
          status: Database["public"]["Enums"]["insight_status"]
          strength: number | null
        }
        Insert: {
          evidence?: Json | null
          first_seen_at?: string
          id?: string
          last_confirmed_at?: string
          organization_id: string
          scope?: Json | null
          statement: string
          status?: Database["public"]["Enums"]["insight_status"]
          strength?: number | null
        }
        Update: {
          evidence?: Json | null
          first_seen_at?: string
          id?: string
          last_confirmed_at?: string
          organization_id?: string
          scope?: Json | null
          statement?: string
          status?: Database["public"]["Enums"]["insight_status"]
          strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          added_by: string | null
          analysis: Json | null
          caption: string | null
          comments: number | null
          cover_url: string | null
          created_at: string
          creator_handle: string | null
          duration_s: number | null
          external_id: string | null
          format: Database["public"]["Enums"]["post_format"] | null
          headline: string | null
          hook_text: string | null
          hook_type: Database["public"]["Enums"]["hook_type"] | null
          id: string
          intent: string | null
          likes: number | null
          niche: string | null
          note: string | null
          organization_id: string
          source: string
          status: string
          tags: string[] | null
          theme: string | null
          url: string | null
          views: number | null
          vx: number | null
        }
        Insert: {
          added_by?: string | null
          analysis?: Json | null
          caption?: string | null
          comments?: number | null
          cover_url?: string | null
          created_at?: string
          creator_handle?: string | null
          duration_s?: number | null
          external_id?: string | null
          format?: Database["public"]["Enums"]["post_format"] | null
          headline?: string | null
          hook_text?: string | null
          hook_type?: Database["public"]["Enums"]["hook_type"] | null
          id?: string
          intent?: string | null
          likes?: number | null
          niche?: string | null
          note?: string | null
          organization_id: string
          source?: string
          status?: string
          tags?: string[] | null
          theme?: string | null
          url?: string | null
          views?: number | null
          vx?: number | null
        }
        Update: {
          added_by?: string | null
          analysis?: Json | null
          caption?: string | null
          comments?: number | null
          cover_url?: string | null
          created_at?: string
          creator_handle?: string | null
          duration_s?: number | null
          external_id?: string | null
          format?: Database["public"]["Enums"]["post_format"] | null
          headline?: string | null
          hook_text?: string | null
          hook_type?: Database["public"]["Enums"]["hook_type"] | null
          id?: string
          intent?: string | null
          likes?: number | null
          niche?: string | null
          note?: string | null
          organization_id?: string
          source?: string
          status?: string
          tags?: string[] | null
          theme?: string | null
          url?: string | null
          views?: number | null
          vx?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "library_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_baselines: {
        Row: {
          channel: Database["public"]["Enums"]["social_channel"]
          computed_at: string
          format: Database["public"]["Enums"]["post_format"]
          id: string
          median_value: number | null
          metric: string
          organization_id: string
          p25: number | null
          p75: number | null
          window_days: number
        }
        Insert: {
          channel: Database["public"]["Enums"]["social_channel"]
          computed_at?: string
          format: Database["public"]["Enums"]["post_format"]
          id?: string
          median_value?: number | null
          metric: string
          organization_id: string
          p25?: number | null
          p75?: number | null
          window_days?: number
        }
        Update: {
          channel?: Database["public"]["Enums"]["social_channel"]
          computed_at?: string
          format?: Database["public"]["Enums"]["post_format"]
          id?: string
          median_value?: number | null
          metric?: string
          organization_id?: string
          p25?: number | null
          p75?: number | null
          window_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_baselines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      post_assets: {
        Row: {
          created_at: string
          id: string
          kind: string | null
          post_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string | null
          post_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string | null
          post_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_assets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metrics: {
        Row: {
          captured_at: string
          clicks: number | null
          comments: number | null
          followers_delta: number | null
          id: string
          impressions: number | null
          likes: number | null
          post_id: string
          raw: Json | null
          reach: number | null
          retention_pct: number | null
          saves: number | null
          shares: number | null
          source: string
          watch_time_s: number | null
        }
        Insert: {
          captured_at?: string
          clicks?: number | null
          comments?: number | null
          followers_delta?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id: string
          raw?: Json | null
          reach?: number | null
          retention_pct?: number | null
          saves?: number | null
          shares?: number | null
          source?: string
          watch_time_s?: number | null
        }
        Update: {
          captured_at?: string
          clicks?: number | null
          comments?: number | null
          followers_delta?: number | null
          id?: string
          impressions?: number | null
          likes?: number | null
          post_id?: string
          raw?: Json | null
          reach?: number | null
          retention_pct?: number | null
          saves?: number | null
          shares?: number | null
          source?: string
          watch_time_s?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_versions: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          post_id: string
          version_no: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          post_id: string
          version_no: number
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          post_id?: string
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "post_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          body: string | null
          channel: Database["public"]["Enums"]["social_channel"] | null
          created_at: string
          external_post_id: string | null
          format: Database["public"]["Enums"]["post_format"] | null
          hook: Database["public"]["Enums"]["hook_type"] | null
          id: string
          meta: Json | null
          organization_id: string
          pillar_id: string | null
          published_at: string | null
          scheduled_for: string | null
          status: Database["public"]["Enums"]["post_status"]
          suggestion_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["social_channel"] | null
          created_at?: string
          external_post_id?: string | null
          format?: Database["public"]["Enums"]["post_format"] | null
          hook?: Database["public"]["Enums"]["hook_type"] | null
          id?: string
          meta?: Json | null
          organization_id: string
          pillar_id?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          suggestion_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          channel?: Database["public"]["Enums"]["social_channel"] | null
          created_at?: string
          external_post_id?: string | null
          format?: Database["public"]["Enums"]["post_format"] | null
          hook?: Database["public"]["Enums"]["hook_type"] | null
          id?: string
          meta?: Json | null
          organization_id?: string
          pillar_id?: string | null
          published_at?: string | null
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          suggestion_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_suggestion_fk"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
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
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: string
          organization_id: string
          source: string | null
          system_prompt: string
          title: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: string
          organization_id: string
          source?: string | null
          system_prompt: string
          title: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: string
          organization_id?: string
          source?: string | null
          system_prompt?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      radar_leituras: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          payload: Json
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "radar_leituras_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      references_lib: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          organization_id: string
          storage_path: string | null
          tags: string[] | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          organization_id: string
          storage_path?: string | null
          tags?: string[] | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          organization_id?: string
          storage_path?: string | null
          tags?: string[] | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "references_lib_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "references_lib_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          channel: Database["public"]["Enums"]["social_channel"]
          connected_at: string | null
          created_at: string
          external_id: string | null
          followers: number | null
          handle: string
          id: string
          is_active: boolean
          meta: Json | null
          organization_id: string
          vault_secret_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["social_channel"]
          connected_at?: string | null
          created_at?: string
          external_id?: string | null
          followers?: number | null
          handle: string
          id?: string
          is_active?: boolean
          meta?: Json | null
          organization_id: string
          vault_secret_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["social_channel"]
          connected_at?: string | null
          created_at?: string
          external_id?: string | null
          followers?: number | null
          handle?: string
          id?: string
          is_active?: boolean
          meta?: Json | null
          organization_id?: string
          vault_secret_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          converted_post_id: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["suggestion_kind"]
          organization_id: string
          pillar_id: string | null
          priority: number | null
          rationale: string | null
          source_insights: string[] | null
          status: string
          suggested_channel:
            | Database["public"]["Enums"]["social_channel"]
            | null
          suggested_format: Database["public"]["Enums"]["post_format"] | null
          title: string
        }
        Insert: {
          converted_post_id?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["suggestion_kind"]
          organization_id: string
          pillar_id?: string | null
          priority?: number | null
          rationale?: string | null
          source_insights?: string[] | null
          status?: string
          suggested_channel?:
            | Database["public"]["Enums"]["social_channel"]
            | null
          suggested_format?: Database["public"]["Enums"]["post_format"] | null
          title: string
        }
        Update: {
          converted_post_id?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["suggestion_kind"]
          organization_id?: string
          pillar_id?: string | null
          priority?: number | null
          rationale?: string | null
          source_insights?: string[] | null
          status?: string
          suggested_channel?:
            | Database["public"]["Enums"]["social_channel"]
            | null
          suggested_format?: Database["public"]["Enums"]["post_format"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_converted_post_id_fkey"
            columns: ["converted_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accounts_overview: { Args: { p_org: string }; Returns: Json }
      best_time_recommendation: {
        Args: { p_handle?: string; p_org: string }
        Returns: Json
      }
      brain_briefing: {
        Args: { p_handle?: string; p_org: string }
        Returns: Json
      }
      followers_overview: { Args: { p_org: string }; Returns: Json }
      generate_weekly_digest: { Args: never; Returns: number }
      get_library_insights: { Args: { p_org: string }; Returns: Json }
      get_own_reels: {
        Args: { p_handle: string; p_org: string }
        Returns: {
          caption: string
          comments: number
          id: string
          likes: number
          published_at: string
          reach: number
          saves: number
          url: string
          views: number
        }[]
      }
      get_perf_aggregates: { Args: { p_org: string }; Returns: Json }
      get_post_performance: {
        Args: { p_org: string }
        Returns: {
          channel: Database["public"]["Enums"]["social_channel"]
          comments: number
          format: Database["public"]["Enums"]["post_format"]
          hook: Database["public"]["Enums"]["hook_type"]
          intent: string
          likes: number
          pillar: string
          post_id: string
          published_at: string
          reach: number
          reach_x: number
          saves: number
          saves_x: number
          shares: number
          theme: string
          title: string
        }[]
      }
      get_social_token: { Args: { p_secret_name: string }; Returns: string }
      goals_overview: { Args: { p_org: string }; Returns: Json }
      has_org_role: {
        Args: { org: string; roles: Database["public"]["Enums"]["org_role"][] }
        Returns: boolean
      }
      is_org_member: { Args: { org: string }; Returns: boolean }
      join_organization: { Args: { p_code?: string }; Returns: Json }
      kpis_taxas: {
        Args: { p_dias?: number; p_handle?: string; p_org: string }
        Returns: Json
      }
      metric_daily: {
        Args: {
          p_from: string
          p_handle: string
          p_metric: string
          p_org: string
          p_to: string
        }
        Returns: {
          d: string
          valor: number
        }[]
      }
      radar_own_reels: {
        Args: { p_handle: string; p_org: string }
        Returns: {
          caption: string
          comments: number
          id: string
          likes: number
          published_at: string
          reach: number
          saves: number
          url: string
          views: number
          vx: number
        }[]
      }
      radar_own_top_reels: {
        Args: { p_limit?: number; p_org: string }
        Returns: {
          caption: string
          handle: string
          id: string
          url: string
          views: number
          vx: number
        }[]
      }
      radar_ranking: {
        Args: { p_dias?: number; p_handle?: string; p_org: string }
        Returns: {
          caption: string
          comments: number
          eng_pr: number
          handle: string
          hook: string
          hook_pct: number
          id: string
          intent: string
          lever: string
          lever_pct: number
          likes: number
          plays: number
          published_at: string
          rank_geral: number
          rank_perfil: number
          reach: number
          reach_rate: number
          saves: number
          saves_pr: number
          score: number
          shares: number
          shares_pr: number
          theme: string
          url: string
          vx: number
          watch_s: number
        }[]
      }
      recompute_baselines: { Args: never; Returns: undefined }
      set_social_token: {
        Args: { p_secret: string; p_secret_name: string }
        Returns: undefined
      }
    }
    Enums: {
      hook_type:
        | "question"
        | "bold_claim"
        | "story"
        | "stat"
        | "contrarian"
        | "list"
        | "news"
        | "how_to"
        | "other"
      insight_status: "active" | "weakening" | "refuted"
      org_role: "owner" | "admin" | "editor" | "writer" | "reviewer" | "viewer"
      post_format:
        | "reel"
        | "carousel"
        | "image"
        | "story"
        | "video_long"
        | "short"
        | "text"
        | "article"
        | "other"
      post_status:
        | "idea"
        | "script"
        | "design"
        | "review"
        | "approved"
        | "scheduled"
        | "published"
        | "archived"
      social_channel: "instagram" | "linkedin" | "tiktok" | "youtube"
      suggestion_kind:
        | "theme"
        | "improvement"
        | "format"
        | "timing"
        | "pillar_alert"
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
      hook_type: [
        "question",
        "bold_claim",
        "story",
        "stat",
        "contrarian",
        "list",
        "news",
        "how_to",
        "other",
      ],
      insight_status: ["active", "weakening", "refuted"],
      org_role: ["owner", "admin", "editor", "writer", "reviewer", "viewer"],
      post_format: [
        "reel",
        "carousel",
        "image",
        "story",
        "video_long",
        "short",
        "text",
        "article",
        "other",
      ],
      post_status: [
        "idea",
        "script",
        "design",
        "review",
        "approved",
        "scheduled",
        "published",
        "archived",
      ],
      social_channel: ["instagram", "linkedin", "tiktok", "youtube"],
      suggestion_kind: [
        "theme",
        "improvement",
        "format",
        "timing",
        "pillar_alert",
      ],
    },
  },
} as const
