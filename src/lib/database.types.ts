export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          title: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          excerpt: string | null
          category: string | null
          type: 'article' | 'video' | 'app' | 'weblink'
          image_url: string | null
          video_url: string | null
          app_url: string | null
          web_url: string | null
          featured: boolean
          active: boolean
          likes: number
          duration: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string | null
          excerpt?: string | null
          category?: string | null
          type: 'article' | 'video' | 'app' | 'weblink'
          image_url?: string | null
          video_url?: string | null
          app_url?: string | null
          web_url?: string | null
          featured?: boolean
          active?: boolean
          likes?: number
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string | null
          excerpt?: string | null
          category?: string | null
          type?: 'article' | 'video' | 'app' | 'weblink'
          image_url?: string | null
          video_url?: string | null
          app_url?: string | null
          web_url?: string | null
          featured?: boolean
          active?: boolean
          likes?: number
          duration?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}