-- ============================================
-- RAMAZAN YARDIMI YÖNETİM SİSTEMİ
-- SUPABASE VERITABANI KURULUM SCRİPTİ
-- ============================================

-- Bu script'i Supabase SQL Editor'de sırasıyla çalıştırın

-- ============================================
-- 1. MAHALLELER TABLOSU
-- ============================================
CREATE TABLE public.mahalleler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad VARCHAR(100) NOT NULL UNIQUE,
    mahalle_baskani_adi VARCHAR(100) NOT NULL,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mahalle verilerini ekle
INSERT INTO public.mahalleler (ad, mahalle_baskani_adi) VALUES
    ('Altınşehir', 'Derviş Yıldırım'),
    ('Bahçeşehir 1', 'Serdar Kalbişen'),
    ('Bahçeşehir 2', 'Hüseyin Oktay'),
    ('Başakşehir Mahallesi', 'Ömer Başkan'),
    ('Başak 1', 'Suat Ekinci'),
    ('Başak 2', 'Yunus Oğuz'),
    ('Fenertepe', 'Fehmi Avşar'),
    ('Kayaşehir', 'Aydın Kıskaç'),
    ('Şamlar (vekalet)', 'Dursun Önder'),
    ('Ziya Gökalp', 'Rahmi Başkan');

-- ============================================
-- 2. KULLANICI PROFİLLERİ TABLOSU
-- ============================================
CREATE TABLE public.kullanici_profilleri (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ad_soyad VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'mahalle_baskani', 'kullanici')),
    mahalle_id UUID REFERENCES public.mahalleler(id),
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mahalle başkanları için mahalle_id zorunlu
ALTER TABLE public.kullanici_profilleri 
ADD CONSTRAINT mahalle_baskani_mahalle_check 
CHECK (
    (rol = 'mahalle_baskani' AND mahalle_id IS NOT NULL) OR 
    (rol != 'mahalle_baskani')
);

-- ============================================
-- 3. YARDIM KAYITLARI TABLOSU
-- ============================================
CREATE TABLE public.yardim_kayitlari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tc_kimlik_no CHAR(11) NOT NULL,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    adres TEXT NOT NULL,
    telefon VARCHAR(20),
    mahalle_id UUID NOT NULL REFERENCES public.mahalleler(id),
    kaydeden_kullanici_id UUID NOT NULL REFERENCES auth.users(id),
    aciklama TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_tc_kimlik UNIQUE (tc_kimlik_no),
    CONSTRAINT tc_format_check CHECK (tc_kimlik_no ~ '^[1-9][0-9]{10}$')
);

-- İndeksler
CREATE INDEX idx_yardim_tc ON public.yardim_kayitlari(tc_kimlik_no);
CREATE INDEX idx_yardim_mahalle ON public.yardim_kayitlari(mahalle_id);
CREATE INDEX idx_yardim_kullanici ON public.yardim_kayitlari(kaydeden_kullanici_id);
CREATE INDEX idx_yardim_created ON public.yardim_kayitlari(created_at);
CREATE INDEX idx_yardim_ad_soyad ON public.yardim_kayitlari(ad, soyad);

-- ============================================
-- 4. MÜKERRER DENEME LOGU
-- ============================================
CREATE TABLE public.mukerrer_denemeler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tc_kimlik_no CHAR(11) NOT NULL,
    ad VARCHAR(50),
    soyad VARCHAR(50),
    adres TEXT,
    telefon VARCHAR(20),
    deneme_yapan_kullanici_id UUID NOT NULL REFERENCES auth.users(id),
    mahalle_id UUID NOT NULL REFERENCES public.mahalleler(id),
    hata_mesaji TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mukerrer_tc ON public.mukerrer_denemeler(tc_kimlik_no);
CREATE INDEX idx_mukerrer_kullanici ON public.mukerrer_denemeler(deneme_yapan_kullanici_id);
CREATE INDEX idx_mukerrer_created ON public.mukerrer_denemeler(created_at);

-- ============================================
-- 5. TC KİMLİK NO DOĞRULAMA FONKSİYONU
-- ============================================
CREATE OR REPLACE FUNCTION public.tc_kimlik_dogrula(tc CHAR(11))
RETURNS BOOLEAN AS $$
DECLARE
    hane INT[] := ARRAY[0,0,0,0,0,0,0,0,0,0,0];
    tek_toplam INT := 0;
    cift_toplam INT := 0;
    onuncu_hane INT;
    onbirinci_hane INT;
    i INT;
BEGIN
    IF LENGTH(tc) != 11 THEN
        RETURN FALSE;
    END IF;
    
    IF tc !~ '^[1-9][0-9]{10}$' THEN
        RETURN FALSE;
    END IF;
    
    FOR i IN 1..11 LOOP
        hane[i] := SUBSTRING(tc FROM i FOR 1)::INT;
    END LOOP;
    
    FOR i IN 1..9 BY 2 LOOP
        tek_toplam := tek_toplam + hane[i];
    END LOOP;
    
    FOR i IN 2..8 BY 2 LOOP
        cift_toplam := cift_toplam + hane[i];
    END LOOP;
    
    onuncu_hane := ((tek_toplam * 7) - cift_toplam) % 10;
    IF onuncu_hane != hane[10] THEN
        RETURN FALSE;
    END IF;
    
    onbirinci_hane := (tek_toplam + cift_toplam + hane[10]) % 10;
    IF onbirinci_hane != hane[11] THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 6. YARDIM KAYDI EKLEME FONKSİYONU
-- ============================================
CREATE OR REPLACE FUNCTION public.yardim_kaydi_ekle(
    p_tc_kimlik_no CHAR(11),
    p_ad VARCHAR(50),
    p_soyad VARCHAR(50),
    p_adres TEXT,
    p_mahalle_id UUID,
    p_telefon VARCHAR(20) DEFAULT NULL,
    p_aciklama TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_kullanici_id UUID;
    v_kullanici_mahalle UUID;
    v_kullanici_rol VARCHAR(20);
    v_yeni_kayit UUID;
    v_hata_mesaji TEXT;
BEGIN
    v_kullanici_id := auth.uid();
    
    SELECT mahalle_id, rol INTO v_kullanici_mahalle, v_kullanici_rol
    FROM public.kullanici_profilleri
    WHERE id = v_kullanici_id AND aktif = true;
    
    IF v_kullanici_mahalle IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Kullanıcı profili bulunamadı veya aktif değil'
        );
    END IF;
    
    IF p_tc_kimlik_no IS NULL OR LENGTH(TRIM(p_tc_kimlik_no)) = 0 THEN
        v_hata_mesaji := 'TC Kimlik No zorunludur';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (COALESCE(p_tc_kimlik_no, '00000000000'), p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    IF p_ad IS NULL OR LENGTH(TRIM(p_ad)) = 0 THEN
        v_hata_mesaji := 'Ad zorunludur';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    IF p_soyad IS NULL OR LENGTH(TRIM(p_soyad)) = 0 THEN
        v_hata_mesaji := 'Soyad zorunludur';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    IF p_adres IS NULL OR LENGTH(TRIM(p_adres)) = 0 THEN
        v_hata_mesaji := 'Adres zorunludur';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    IF NOT public.tc_kimlik_dogrula(p_tc_kimlik_no) THEN
        v_hata_mesaji := 'Geçersiz TC Kimlik No';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    IF v_kullanici_rol != 'admin' AND v_kullanici_mahalle != p_mahalle_id THEN
        v_hata_mesaji := 'Bu mahalleye kayıt yetkiniz yok';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji);
    END IF;
    
    BEGIN
        INSERT INTO public.yardim_kayitlari (
            tc_kimlik_no, ad, soyad, adres, telefon, mahalle_id, kaydeden_kullanici_id, aciklama
        )
        VALUES (
            p_tc_kimlik_no, TRIM(p_ad), TRIM(p_soyad), TRIM(p_adres), 
            NULLIF(TRIM(COALESCE(p_telefon, '')), ''),
            p_mahalle_id, v_kullanici_id, NULLIF(TRIM(COALESCE(p_aciklama, '')), '')
        )
        RETURNING id INTO v_yeni_kayit;
        
        RETURN json_build_object('success', true, 'id', v_yeni_kayit, 'message', 'Kayıt başarıyla eklendi');
        
    EXCEPTION WHEN unique_violation THEN
        v_hata_mesaji := 'Bu TC kimlik no zaten kayıtlı';
        INSERT INTO public.mukerrer_denemeler (tc_kimlik_no, ad, soyad, adres, telefon, deneme_yapan_kullanici_id, mahalle_id, hata_mesaji)
        VALUES (p_tc_kimlik_no, p_ad, p_soyad, p_adres, p_telefon, v_kullanici_id, p_mahalle_id, v_hata_mesaji);
        RETURN json_build_object('success', false, 'error', v_hata_mesaji, 'error_code', 'DUPLICATE_TC');
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. YARDIMCI FONKSİYONLAR
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR AS $$
    SELECT rol FROM public.kullanici_profilleri WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_mahalle()
RETURNS UUID AS $$
    SELECT mahalle_id FROM public.kullanici_profilleri WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.kullanici_profilleri WHERE id = auth.uid() AND rol = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_mahalle_baskani()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.kullanici_profilleri WHERE id = auth.uid() AND rol = 'mahalle_baskani');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 8. TRİGGER FONKSİYONLARI
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kullanici_profilleri_updated_at
    BEFORE UPDATE ON public.kullanici_profilleri
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yardim_kayitlari_updated_at
    BEFORE UPDATE ON public.yardim_kayitlari
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.kullanici_profilleri (id, ad_soyad, email, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'ad_soyad', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'rol', 'kullanici')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.mahalleler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kullanici_profilleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yardim_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mukerrer_denemeler ENABLE ROW LEVEL SECURITY;

-- Mahalleler - Herkes görebilir
CREATE POLICY "Mahalleler herkese görünür"
ON public.mahalleler FOR SELECT
TO authenticated USING (true);

-- Kullanıcı Profilleri
CREATE POLICY "Kullanıcı kendi profilini görebilir"
ON public.kullanici_profilleri FOR SELECT
TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admin tüm profilleri görebilir"
ON public.kullanici_profilleri FOR SELECT
TO authenticated USING (
    EXISTS (SELECT 1 FROM public.kullanici_profilleri WHERE id = auth.uid() AND rol = 'admin')
);

CREATE POLICY "Mahalle başkanı kendi mahalle kullanıcılarını görebilir"
ON public.kullanici_profilleri FOR SELECT
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.kullanici_profilleri kb
        WHERE kb.id = auth.uid() AND kb.rol = 'mahalle_baskani'
        AND kb.mahalle_id = kullanici_profilleri.mahalle_id
    )
);

-- Yardım Kayıtları
CREATE POLICY "Kullanıcı kendi kayıtlarını görebilir"
ON public.yardim_kayitlari FOR SELECT
TO authenticated USING (kaydeden_kullanici_id = auth.uid());

CREATE POLICY "Mahalle başkanı kendi mahalle kayıtlarını görebilir"
ON public.yardim_kayitlari FOR SELECT
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.kullanici_profilleri
        WHERE id = auth.uid() AND rol = 'mahalle_baskani'
        AND mahalle_id = yardim_kayitlari.mahalle_id
    )
);

CREATE POLICY "Admin tüm kayıtları görebilir"
ON public.yardim_kayitlari FOR SELECT
TO authenticated USING (
    EXISTS (SELECT 1 FROM public.kullanici_profilleri WHERE id = auth.uid() AND rol = 'admin')
);

CREATE POLICY "Kullanıcı kendi mahallesine kayıt ekleyebilir"
ON public.yardim_kayitlari FOR INSERT
TO authenticated WITH CHECK (
    kaydeden_kullanici_id = auth.uid() AND
    mahalle_id IN (SELECT mahalle_id FROM public.kullanici_profilleri WHERE id = auth.uid())
);

-- Mükerrer Denemeler
CREATE POLICY "Admin mükerrer denemeleri görebilir"
ON public.mukerrer_denemeler FOR SELECT
TO authenticated USING (
    EXISTS (SELECT 1 FROM public.kullanici_profilleri WHERE id = auth.uid() AND rol = 'admin')
);

CREATE POLICY "Mahalle başkanı kendi mahalle denemelerini görebilir"
ON public.mukerrer_denemeler FOR SELECT
TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.kullanici_profilleri
        WHERE id = auth.uid() AND rol = 'mahalle_baskani'
        AND mahalle_id = mukerrer_denemeler.mahalle_id
    )
);

CREATE POLICY "Sistem mükerrer deneme ekleyebilir"
ON public.mukerrer_denemeler FOR INSERT
TO authenticated WITH CHECK (deneme_yapan_kullanici_id = auth.uid());

-- ============================================
-- 10. VIEW'LAR
-- ============================================
CREATE OR REPLACE VIEW public.mahalle_istatistikleri AS
SELECT 
    m.id as mahalle_id,
    m.ad as mahalle_adi,
    m.mahalle_baskani_adi,
    COUNT(DISTINCT yk.id) as toplam_kayit,
    COUNT(DISTINCT yk.kaydeden_kullanici_id) as aktif_kullanici_sayisi,
    COUNT(DISTINCT md.id) as mukerrer_deneme_sayisi,
    MAX(yk.created_at) as son_kayit_tarihi,
    MIN(yk.created_at) as ilk_kayit_tarihi,
    COUNT(DISTINCT CASE WHEN yk.telefon IS NOT NULL THEN yk.id END) as telefon_olan_kayit_sayisi
FROM public.mahalleler m
LEFT JOIN public.yardim_kayitlari yk ON m.id = yk.mahalle_id
LEFT JOIN public.mukerrer_denemeler md ON m.id = md.mahalle_id
GROUP BY m.id, m.ad, m.mahalle_baskani_adi
ORDER BY m.ad;

ALTER VIEW public.mahalle_istatistikleri SET (security_invoker = true);

CREATE OR REPLACE VIEW public.kullanici_istatistikleri AS
SELECT 
    kp.id,
    kp.ad_soyad,
    kp.email,
    kp.rol,
    m.ad as mahalle_adi,
    COUNT(yk.id) as toplam_kayit,
    MIN(yk.created_at) as ilk_kayit,
    MAX(yk.created_at) as son_kayit,
    COUNT(CASE WHEN yk.telefon IS NOT NULL THEN 1 END) as telefon_olan_kayit
FROM public.kullanici_profilleri kp
LEFT JOIN public.mahalleler m ON kp.mahalle_id = m.id
LEFT JOIN public.yardim_kayitlari yk ON kp.id = yk.kaydeden_kullanici_id
GROUP BY kp.id, kp.ad_soyad, kp.email, kp.rol, m.ad
ORDER BY toplam_kayit DESC;

ALTER VIEW public.kullanici_istatistikleri SET (security_invoker = true);

CREATE OR REPLACE VIEW public.detayli_kayit_listesi AS
SELECT 
    yk.id,
    yk.tc_kimlik_no,
    yk.ad,
    yk.soyad,
    yk.ad || ' ' || yk.soyad as ad_soyad,
    yk.adres,
    yk.telefon,
    yk.aciklama,
    m.ad as mahalle_adi,
    m.mahalle_baskani_adi,
    kp.ad_soyad as kaydeden_ad_soyad,
    kp.email as kaydeden_email,
    yk.created_at as kayit_tarihi,
    yk.updated_at as guncelleme_tarihi
FROM public.yardim_kayitlari yk
INNER JOIN public.mahalleler m ON yk.mahalle_id = m.id
INNER JOIN public.kullanici_profilleri kp ON yk.kaydeden_kullanici_id = kp.id
ORDER BY yk.created_at DESC;

ALTER VIEW public.detayli_kayit_listesi SET (security_invoker = true);

CREATE OR REPLACE VIEW public.mukerrer_denemeler_detay AS
SELECT 
    md.id,
    md.tc_kimlik_no,
    md.ad,
    md.soyad,
    md.ad || ' ' || COALESCE(md.soyad, '') as ad_soyad,
    md.adres,
    md.telefon,
    md.hata_mesaji,
    m.ad as mahalle_adi,
    kp.ad_soyad as deneme_yapan,
    kp.email as deneme_yapan_email,
    md.created_at as deneme_tarihi,
    yk.ad as mevcut_ad,
    yk.soyad as mevcut_soyad,
    yk.mahalle_id as mevcut_mahalle_id,
    m2.ad as mevcut_mahalle_adi
FROM public.mukerrer_denemeler md
INNER JOIN public.mahalleler m ON md.mahalle_id = m.id
INNER JOIN public.kullanici_profilleri kp ON md.deneme_yapan_kullanici_id = kp.id
LEFT JOIN public.yardim_kayitlari yk ON md.tc_kimlik_no = yk.tc_kimlik_no
LEFT JOIN public.mahalleler m2 ON yk.mahalle_id = m2.id
ORDER BY md.created_at DESC;

ALTER VIEW public.mukerrer_denemeler_detay SET (security_invoker = true);

-- ============================================
-- KURULUM TAMAMLANDI
-- ============================================

-- Şimdi yapmanız gerekenler:
-- 1. Supabase Dashboard > Authentication > Users bölümünden ilk kullanıcıyı oluşturun
-- 2. Aşağıdaki SQL ile kullanıcıyı admin yapın:

/*
UPDATE public.kullanici_profilleri
SET rol = 'admin'
WHERE email = 'admin@example.com';
*/

-- 3. Mahalle başkanları için:
/*
-- Önce mahalle ID'sini bulun
SELECT id, ad FROM public.mahalleler WHERE ad = 'Altınşehir';

-- Sonra kullanıcıyı mahalle başkanı yapın
UPDATE public.kullanici_profilleri
SET 
  rol = 'mahalle_baskani',
  mahalle_id = 'mahalle-uuid-buraya'
WHERE email = 'mahalle.baskani@example.com';
*/
