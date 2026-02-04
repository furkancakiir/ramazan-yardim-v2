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
      mahalleler: {
        Row: {
          id: string
          ad: string
          mahalle_baskani_adi: string
          aktif: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ad: string
          mahalle_baskani_adi: string
          aktif?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ad?: string
          mahalle_baskani_adi?: string
          aktif?: boolean
          created_at?: string
        }
      }
      kullanici_profilleri: {
        Row: {
          id: string
          ad_soyad: string
          email: string
          rol: 'admin' | 'mahalle_baskani' | 'kullanici'
          mahalle_id: string | null
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          ad_soyad: string
          email: string
          rol: 'admin' | 'mahalle_baskani' | 'kullanici'
          mahalle_id?: string | null
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ad_soyad?: string
          email?: string
          rol?: 'admin' | 'mahalle_baskani' | 'kullanici'
          mahalle_id?: string | null
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      yardim_kayitlari: {
        Row: {
          id: string
          tc_kimlik_no: string
          ad: string
          soyad: string
          adres: string
          telefon: string | null
          mahalle_id: string
          kaydeden_kullanici_id: string
          aciklama: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tc_kimlik_no: string
          ad: string
          soyad: string
          adres: string
          telefon?: string | null
          mahalle_id: string
          kaydeden_kullanici_id: string
          aciklama?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tc_kimlik_no?: string
          ad?: string
          soyad?: string
          adres?: string
          telefon?: string | null
          mahalle_id?: string
          kaydeden_kullanici_id?: string
          aciklama?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mukerrer_denemeler: {
        Row: {
          id: string
          tc_kimlik_no: string
          ad: string | null
          soyad: string | null
          adres: string | null
          telefon: string | null
          deneme_yapan_kullanici_id: string
          mahalle_id: string
          hata_mesaji: string | null
          created_at: string
        }
      }
    }
    Views: {
      mahalle_istatistikleri: {
        Row: {
          mahalle_id: string
          mahalle_adi: string
          mahalle_baskani_adi: string
          toplam_kayit: number
          aktif_kullanici_sayisi: number
          mukerrer_deneme_sayisi: number
          son_kayit_tarihi: string | null
          ilk_kayit_tarihi: string | null
          telefon_olan_kayit_sayisi: number
        }
      }
      kullanici_istatistikleri: {
        Row: {
          id: string
          ad_soyad: string
          email: string
          rol: string
          mahalle_adi: string | null
          toplam_kayit: number
          ilk_kayit: string | null
          son_kayit: string | null
          telefon_olan_kayit: number
        }
      }
      detayli_kayit_listesi: {
        Row: {
          id: string
          tc_kimlik_no: string
          ad: string
          soyad: string
          ad_soyad: string
          adres: string
          telefon: string | null
          aciklama: string | null
          mahalle_adi: string
          mahalle_baskani_adi: string
          kaydeden_ad_soyad: string
          kaydeden_email: string
          kayit_tarihi: string
          guncelleme_tarihi: string
        }
      }
      mukerrer_denemeler_detay: {
        Row: {
          id: string
          tc_kimlik_no: string
          ad: string | null
          soyad: string | null
          ad_soyad: string
          adres: string | null
          telefon: string | null
          hata_mesaji: string | null
          mahalle_adi: string
          deneme_yapan: string
          deneme_yapan_email: string
          deneme_tarihi: string
          mevcut_ad: string | null
          mevcut_soyad: string | null
          mevcut_mahalle_id: string | null
          mevcut_mahalle_adi: string | null
        }
      }
    }
    Functions: {
      yardim_kaydi_ekle: {
        Args: {
          p_tc_kimlik_no: string
          p_ad: string
          p_soyad: string
          p_adres: string
          p_mahalle_id: string
          p_telefon?: string
          p_aciklama?: string
        }
        Returns: {
          success: boolean
          error?: string
          id?: string
          message?: string
          error_code?: string
        }
      }
      tc_kimlik_dogrula: {
        Args: {
          tc: string
        }
        Returns: boolean
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_mahalle: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_mahalle_baskani: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
  }
}

// Helper Types
export type Mahalle = Database['public']['Tables']['mahalleler']['Row']
export type KullaniciProfili = Database['public']['Tables']['kullanici_profilleri']['Row']
export type YardimKaydi = Database['public']['Tables']['yardim_kayitlari']['Row']
export type MukerrerDeneme = Database['public']['Tables']['mukerrer_denemeler']['Row']

export type MahalleIstatistik = Database['public']['Views']['mahalle_istatistikleri']['Row']
export type KullaniciIstatistik = Database['public']['Views']['kullanici_istatistikleri']['Row']
export type DetayliKayit = Database['public']['Views']['detayli_kayit_listesi']['Row']
export type MukerrerDenemeDetay = Database['public']['Views']['mukerrer_denemeler_detay']['Row']

export type UserRole = 'admin' | 'mahalle_baskani' | 'kullanici'

export interface YardimKaydiEkleResponse {
  success: boolean
  error?: string
  id?: string
  message?: string
  error_code?: string
}
