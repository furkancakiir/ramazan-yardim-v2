'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Download, FileSpreadsheet, AlertCircle } from 'lucide-react'
import type { DetayliKayit, MukerrerDenemeDetay } from '@/types/database.types'

export default function RaporlarPage() {
  const [kayitlar, setKayitlar] = useState<DetayliKayit[]>([])
  const [mukerrerDenemeler, setMukerrerDenemeler] = useState<MukerrerDenemeDetay[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [kayitlarRes, mukerrerRes] = await Promise.all([
      supabase.from('detayli_kayit_listesi').select('*').order('kayit_tarihi', { ascending: false }),
      supabase.from('mukerrer_denemeler_detay').select('*').order('deneme_tarihi', { ascending: false })
    ])

    if (kayitlarRes.data) setKayitlar(kayitlarRes.data)
    if (mukerrerRes.data) setMukerrerDenemeler(mukerrerRes.data)
    setLoading(false)
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    )

    const csv = [headers, ...rows].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportKayitlar = () => {
    const exportData = kayitlar.map(k => ({
      'TC Kimlik No': k.tc_kimlik_no,
      'Ad Soyad': k.ad_soyad,
      'Adres': k.adres,
      'Telefon': k.telefon || '-',
      'Mahalle': k.mahalle_adi,
      'Kaydeden': k.kaydeden_ad_soyad,
      'Kayıt Tarihi': new Date(k.kayit_tarihi).toLocaleString('tr-TR'),
      'Açıklama': k.aciklama || '-'
    }))
    exportToCSV(exportData, 'yardim_kayitlari')
  }

  const exportMukerrer = () => {
    const exportData = mukerrerDenemeler.map(m => ({
      'TC Kimlik No': m.tc_kimlik_no,
      'Ad Soyad': m.ad_soyad,
      'Mahalle': m.mahalle_adi,
      'Deneme Yapan': m.deneme_yapan,
      'Hata': m.hata_mesaji || '-',
      'Tarih': new Date(m.deneme_tarihi).toLocaleString('tr-TR'),
      'Mevcut Mahalle': m.mevcut_mahalle_adi || '-'
    }))
    exportToCSV(exportData, 'mukerrer_denemeler')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raporlar</h1>
        <p className="text-gray-600 mt-1">Tüm kayıtları CSV formatında indirebilirsiniz</p>
      </div>

      {/* Yardım Kayıtları */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Yardım Kayıtları</h2>
            <p className="text-sm text-gray-600 mt-1">Toplam {kayitlar.length} kayıt</p>
          </div>
          <button
            onClick={exportKayitlar}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            CSV İndir
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TC Kimlik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mahalle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaydeden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kayitlar.slice(0, 100).map((kayit) => (
                <tr key={kayit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {kayit.tc_kimlik_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {kayit.ad_soyad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {kayit.mahalle_adi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {kayit.kaydeden_ad_soyad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(kayit.kayit_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {kayitlar.length > 100 && (
          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600 text-center">
            İlk 100 kayıt gösteriliyor. Tüm kayıtlar için CSV dosyasını indirin.
          </div>
        )}
      </div>

      {/* Mükerrer Denemeler */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={24} />
              Mükerrer Denemeler
            </h2>
            <p className="text-sm text-gray-600 mt-1">Toplam {mukerrerDenemeler.length} deneme</p>
          </div>
          <button
            onClick={exportMukerrer}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Download size={20} />
            CSV İndir
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TC Kimlik</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deneme Yapan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mahalle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hata</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mukerrerDenemeler.slice(0, 100).map((deneme) => (
                <tr key={deneme.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deneme.tc_kimlik_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {deneme.deneme_yapan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {deneme.mahalle_adi}
                  </td>
                  <td className="px-6 py-4 text-sm text-orange-600">
                    {deneme.hata_mesaji}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deneme.deneme_tarihi).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mukerrerDenemeler.length > 100 && (
          <div className="px-6 py-4 bg-gray-50 text-sm text-gray-600 text-center">
            İlk 100 deneme gösteriliyor. Tüm denemeler için CSV dosyasını indirin.
          </div>
        )}
      </div>
    </div>
  )
}
