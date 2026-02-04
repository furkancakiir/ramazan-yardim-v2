import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { UserPlus, Search } from 'lucide-react'

export default async function MahalleBaskaniDashboard() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('kullanici_profilleri')
    .select('*, mahalleler(*)')
    .eq('id', user?.id)
    .single()

  // Mahalle kayıtlarını getir
  const { data: kayitlar } = await supabase
    .from('detayli_kayit_listesi')
    .select('*')
    .eq('mahalle_adi', profile?.mahalleler?.ad)
    .order('kayit_tarihi', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kayıtlar</h1>
          <p className="text-gray-600 mt-1">{profile?.mahalleler?.ad} Mahallesi</p>
        </div>
        <Link
          href="/mahalle-baskani/yeni-kayit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <UserPlus size={20} />
          Yeni Kayıt
        </Link>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Toplam Kayıt</p>
          <p className="text-3xl font-bold text-gray-900">{kayitlar?.length || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Bugün Eklenen</p>
          <p className="text-3xl font-bold text-green-600">
            {kayitlar?.filter(k => {
              const today = new Date().toDateString()
              const kayitDate = new Date(k.kayit_tarihi).toDateString()
              return today === kayitDate
            }).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Telefon Olan</p>
          <p className="text-3xl font-bold text-blue-600">
            {kayitlar?.filter(k => k.telefon).length || 0}
          </p>
        </div>
      </div>

      {/* Kayıt Listesi */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Son Kayıtlar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TC Kimlik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kaydeden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kayitlar?.map((kayit) => (
                <tr key={kayit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{kayit.tc_kimlik_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{kayit.ad_soyad}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">{kayit.adres}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{kayit.telefon || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{kayit.kaydeden_ad_soyad}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(kayit.kayit_tarihi).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {kayitlar?.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz kayıt yok</h3>
            <p className="mt-1 text-sm text-gray-500">İlk kaydınızı eklemek için yeni kayıt butonuna tıklayın.</p>
            <div className="mt-6">
              <Link
                href="/mahalle-baskani/yeni-kayit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <UserPlus size={20} />
                Yeni Kayıt Ekle
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
