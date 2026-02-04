# Ramazan Yardımı Yönetim Sistemi

Ramazan yardımı kayıt ve yönetim sistemi - Next.js 14 + Supabase

## 🚀 Özellikler

### Genel
- ✅ Supabase Auth (Email/Password + Google OAuth)
- ✅ Rol bazlı yetkilendirme (Admin, Mahalle Başkanı, Kullanıcı)
- ✅ Row Level Security (RLS) ile veri güvenliği
- ✅ TC Kimlik No algoritmic doğrulama
- ✅ Mükerrer kayıt engelleme
- ✅ Responsive tasarım

### Admin Paneli
- ✅ Genel istatistikler (toplam kayıt, mahalle, kullanıcı)
- ✅ Mahalle bazlı raporlar
- ✅ Kullanıcı performans takibi
- ✅ CSV/Excel export
- ✅ Mükerrer deneme logları

### Mahalle Başkanı
- ✅ Mahalle kayıtlarını görüntüleme
- ✅ Yeni kayıt ekleme
- ✅ Mahalle istatistikleri
- ✅ Kullanıcı performansı
- ✅ Mükerrer deneme takibi

### Kullanıcı
- ✅ Kendi kayıtlarını görüntüleme
- ✅ Yeni kayıt ekleme
- ✅ Kişisel istatistikler

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

## 🛠️ Kurulum

### 1. Projeyi İndirin
```bash
# Dosyaları bir klasöre çıkarın
cd ramazan-yardim
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
yarn install
```

### 3. Supabase Kurulumu

#### 3.1. Supabase Projesi Oluşturun
1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. Yeni bir proje oluşturun

#### 3.2. Veritabanı Şemasını Oluşturun
SQL Editor'de sırasıyla şu script'leri çalıştırın:

1. Tabloları oluşturun (mahalleler, kullanici_profilleri, yardim_kayitlari, mukerrer_denemeler)
2. TC Kimlik doğrulama fonksiyonunu ekleyin
3. Yardım kaydı ekleme fonksiyonunu ekleyin
4. RLS politikalarını aktifleştirin
5. View'ları oluşturun
6. Trigger'ları ekleyin

*Not: Tüm SQL script'leri proje dökümanlarında mevcuttur.*

#### 3.3. Google OAuth Ayarları (Opsiyonel)
1. Supabase Dashboard > Authentication > Providers
2. Google'ı aktifleştirin
3. Google Cloud Console'dan Client ID ve Secret alın

### 4. Environment Variables
`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Değerleri Supabase Dashboard > Settings > API'den alın.

### 5. İlk Admin Kullanıcıyı Oluşturun

```sql
-- 1. Supabase Dashboard > Authentication > Users
-- Email/Password ile yeni kullanıcı oluşturun

-- 2. SQL Editor'de kullanıcıyı admin yapın:
UPDATE public.kullanici_profilleri
SET rol = 'admin'
WHERE email = 'admin@example.com';
```

### 6. Mahalle Başkanı Kullanıcıları Oluşturun

```sql
-- 1. Kullanıcıyı Authentication'dan oluşturun

-- 2. Mahalle ID'sini bulun:
SELECT id, ad FROM public.mahalleler WHERE ad = 'Altınşehir';

-- 3. Kullanıcıyı mahalle başkanı yapın:
UPDATE public.kullanici_profilleri
SET 
  rol = 'mahalle_baskani',
  mahalle_id = 'mahalle-uuid-buraya'
WHERE email = 'mahalle.baskani@example.com';
```

## 🚀 Çalıştırma

```bash
npm run dev
# veya
yarn dev
```

Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## 📁 Proje Yapısı

```
ramazan-yardim/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login sayfası
│   ├── admin/              # Admin paneli
│   ├── mahalle-baskani/    # Mahalle başkanı paneli
│   ├── kullanici/          # Kullanıcı paneli
│   └── auth/callback/      # OAuth callback
├── components/
│   ├── dashboard/          # Dashboard bileşenleri
│   └── forms/              # Form bileşenleri
├── lib/
│   ├── supabase/           # Supabase client
│   ├── stores/             # Zustand stores
│   └── utils.ts            # Yardımcı fonksiyonlar
├── types/
│   └── database.types.ts   # TypeScript tipleri
└── middleware.ts           # Auth middleware
```

## 🔐 Rol Bazlı Erişim

### Admin
- Tüm mahalleleri görebilir
- Tüm kullanıcıları yönetebilir
- Tüm kayıtları görebilir
- Raporları indirebilir

### Mahalle Başkanı
- Sadece kendi mahallesinin kayıtlarını görebilir
- Yeni kayıt ekleyebilir
- Mahalle istatistiklerini görebilir

### Kullanıcı
- Sadece kendi eklediği kayıtları görebilir
- Yeni kayıt ekleyebilir

## 📊 Veri Modeli

### Tablolar
- `mahalleler` - Mahalle bilgileri
- `kullanici_profilleri` - Kullanıcı profilleri ve rolleri
- `yardim_kayitlari` - Yardım kayıtları (TC, ad, soyad, adres, telefon)
- `mukerrer_denemeler` - Mükerrer deneme logları

### View'lar
- `mahalle_istatistikleri` - Mahalle bazlı istatistikler
- `kullanici_istatistikleri` - Kullanıcı bazlı istatistikler
- `detayli_kayit_listesi` - Detaylı kayıt listesi
- `mukerrer_denemeler_detay` - Mükerrer deneme detayları

## 🔧 Özelleştirme

### Mahalle Ekleme
```sql
INSERT INTO public.mahalleler (ad, mahalle_baskani_adi)
VALUES ('Yeni Mahalle', 'Başkan Adı');
```

### Kullanıcı Rolü Değiştirme
```sql
UPDATE public.kullanici_profilleri
SET rol = 'mahalle_baskani', mahalle_id = 'mahalle-uuid'
WHERE email = 'kullanici@example.com';
```

## 📱 Ekran Görüntüleri

### Login Ekranı
- Email/Password girişi
- Google OAuth girişi

### Admin Dashboard
- Genel istatistikler
- Mahalle listesi
- Kullanıcı listesi
- Rapor indirme

### Mahalle Başkanı Dashboard
- Mahalle kayıtları
- Yeni kayıt formu
- İstatistikler

## 🐛 Sorun Giderme

### "Mahalle bilgisi bulunamadı" Hatası
Kullanıcının mahalle_id'si boş olabilir:
```sql
UPDATE public.kullanici_profilleri
SET mahalle_id = 'mahalle-uuid'
WHERE email = 'kullanici@example.com';
```

### RLS Politikaları Çalışmıyor
Supabase Dashboard > Database > Policies'den politikaların aktif olduğunu kontrol edin.

### Google OAuth Çalışmıyor
- Redirect URL'yi kontrol edin: `http://localhost:3000/auth/callback`
- Google Cloud Console'da Authorized redirect URIs eklenmiş olmalı

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için: [GitHub Issues](https://github.com/yourusername/ramazan-yardim/issues)

---

**Not:** Production ortamına almadan önce:
- [ ] Environment variables'ı production değerleriyle güncelleyin
- [ ] Supabase RLS politikalarını test edin
- [ ] Google OAuth production redirect URL'lerini ekleyin
- [ ] Error tracking sistemi ekleyin (Sentry vb.)
- [ ] Analytics ekleyin (Google Analytics vb.)
"# ramazan-yardim-v2" 
