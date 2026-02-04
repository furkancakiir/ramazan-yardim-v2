'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { validateTCKimlik } from '@/lib/utils'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FormData {
  tc_kimlik_no: string
  ad: string
  soyad: string
  adres: string
  telefon: string
  aciklama: string
}

interface FormErrors {
  tc_kimlik_no?: string
  ad?: string
  soyad?: string
  adres?: string
  telefon?: string
}

interface YardimKayitFormProps {
  mahalleId: string
  mahalleName: string
}

export function YardimKayitForm({ mahalleId, mahalleName }: YardimKayitFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tc_kimlik_no: '',
    ad: '',
    soyad: '',
    adres: '',
    telefon: '',
    aciklama: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.tc_kimlik_no.trim()) {
      newErrors.tc_kimlik_no = 'TC Kimlik No zorunludur'
    } else if (!validateTCKimlik(formData.tc_kimlik_no)) {
      newErrors.tc_kimlik_no = 'Geçerli bir TC Kimlik No giriniz'
    }

    if (!formData.ad.trim()) {
      newErrors.ad = 'Ad zorunludur'
    } else if (formData.ad.trim().length < 2) {
      newErrors.ad = 'Ad en az 2 karakter olmalıdır'
    }

    if (!formData.soyad.trim()) {
      newErrors.soyad = 'Soyad zorunludur'
    } else if (formData.soyad.trim().length < 2) {
      newErrors.soyad = 'Soyad en az 2 karakter olmalıdır'
    }

    if (!formData.adres.trim()) {
      newErrors.adres = 'Adres zorunludur'
    } else if (formData.adres.trim().length < 10) {
      newErrors.adres = 'Adres en az 10 karakter olmalıdır'
    }

    if (formData.telefon.trim() && !/^[0-9()\s\-+]{10,}$/.test(formData.telefon)) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.rpc('yardim_kaydi_ekle', {
        p_tc_kimlik_no: formData.tc_kimlik_no.trim(),
        p_ad: formData.ad.trim(),
        p_soyad: formData.soyad.trim(),
        p_adres: formData.adres.trim(),
        p_mahalle_id: mahalleId,
        p_telefon: formData.telefon.trim() || null,
        p_aciklama: formData.aciklama.trim() || null
      })

      if (error) throw error

      const result = data as any

      if (result.success) {
        setSuccess(true)
        setFormData({
          tc_kimlik_no: '',
          ad: '',
          soyad: '',
          adres: '',
          telefon: '',
          aciklama: ''
        })
        
        setTimeout(() => {
          router.refresh()
          setSuccess(false)
        }, 2000)
      } else {
        setErrorMessage(result.error || 'Kayıt eklenirken bir hata oluştu')
      }
    } catch (err: any) {
      console.error('Kayıt hatası:', err)
      setErrorMessage(err.message || 'Kayıt eklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="text-green-800 font-medium">Kayıt başarıyla eklendi!</p>
            <p className="text-green-700 text-sm">Yeni kayıt ekleyebilirsiniz.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Mahalle Bilgisi */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Mahalle:</span> {mahalleName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TC Kimlik No */}
        <div className="md:col-span-2">
          <label htmlFor="tc_kimlik_no" className="block text-sm font-medium text-gray-700 mb-2">
            TC Kimlik No <span className="text-red-500">*</span>
          </label>
          <input
            id="tc_kimlik_no"
            name="tc_kimlik_no"
            type="text"
            value={formData.tc_kimlik_no}
            onChange={handleChange}
            maxLength={11}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.tc_kimlik_no ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="12345678901"
            disabled={loading}
          />
          {errors.tc_kimlik_no && (
            <p className="text-red-500 text-sm mt-1">{errors.tc_kimlik_no}</p>
          )}
        </div>

        {/* Ad */}
        <div>
          <label htmlFor="ad" className="block text-sm font-medium text-gray-700 mb-2">
            Ad <span className="text-red-500">*</span>
          </label>
          <input
            id="ad"
            name="ad"
            type="text"
            value={formData.ad}
            onChange={handleChange}
            maxLength={50}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.ad ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ahmet"
            disabled={loading}
          />
          {errors.ad && <p className="text-red-500 text-sm mt-1">{errors.ad}</p>}
        </div>

        {/* Soyad */}
        <div>
          <label htmlFor="soyad" className="block text-sm font-medium text-gray-700 mb-2">
            Soyad <span className="text-red-500">*</span>
          </label>
          <input
            id="soyad"
            name="soyad"
            type="text"
            value={formData.soyad}
            onChange={handleChange}
            maxLength={50}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.soyad ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Yılmaz"
            disabled={loading}
          />
          {errors.soyad && <p className="text-red-500 text-sm mt-1">{errors.soyad}</p>}
        </div>

        {/* Adres */}
        <div className="md:col-span-2">
          <label htmlFor="adres" className="block text-sm font-medium text-gray-700 mb-2">
            Adres <span className="text-red-500">*</span>
          </label>
          <textarea
            id="adres"
            name="adres"
            value={formData.adres}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.adres ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tam adres bilgisi..."
            disabled={loading}
          />
          {errors.adres && <p className="text-red-500 text-sm mt-1">{errors.adres}</p>}
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-2">
            Telefon <span className="text-gray-400">(Opsiyonel)</span>
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            value={formData.telefon}
            onChange={handleChange}
            maxLength={20}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.telefon ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0555 123 4567"
            disabled={loading}
          />
          {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon}</p>}
        </div>

        {/* Açıklama */}
        <div className="md:col-span-2">
          <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama <span className="text-gray-400">(Opsiyonel)</span>
          </label>
          <textarea
            id="aciklama"
            name="aciklama"
            value={formData.aciklama}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Ek bilgiler..."
            disabled={loading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </button>
      </div>
    </form>
  )
}
