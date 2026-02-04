import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatNumber } from '@/lib/utils'
import { TrendingUp, Users, AlertCircle, Phone } from 'lucide-react'

export default async function IstatistiklerPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('kullanici_profilleri')
    .select('*, mahalleler(*)')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.mahalle_id) {
    return <div>Mahalle bilgisi bulunamadı</div>
  }

  // Mahalle istatistikleri
  const { data: mahalleStats } = await supabase
    .from('mahalle_istatistikleri')
    .select('*')
    .eq('mahalle_id', profile.mahalle_id)
    .single()

  // Kullanıcı istatistikleri (mahalle bazlı)
  const { data: kullaniciStats } = await supabase
    .from('kullanici_istatistikleri')
    .select('*')
    .eq('mahalle_adi', profile.mahalleler?.ad)
    .order('toplam_kayit', { ascending: false })

  // Mükerrer denemeler
  const { data: mukerrerDenemeler } = await supabase
    .from('mukerrer_denemeler_detay')
    .select('*')
    .eq('mahalle_adi', profile.mahalleler?.ad)
    .order('deneme_tarihi', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">İstatistikler</h1>
        <p className="text-gray-600 mt-1">{profile.mahalleler?.ad} Mahallesi</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kayıt"
          value={formatNumber(mahalleStats?.toplam_kayit || 0)}
          icon={<TrendingUp className="text-green-600" size={24} />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={formatNumber(mahalleStats?.aktif_kullanici_sayisi || 0)}
          icon={<Users className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Telefon Olan"
          value={formatNumber(mahalleStats?.telefon_olan_kayit_sayisi || 0)}
          icon={<Phone className="text-purple-600" size={24} />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Mükerrer Deneme"
          value={formatNumber(mahalleStats?.mukerrer_deneme_sayisi || 0)}
          icon={<AlertCircle className="text-orange-600" size={24} />}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Kullanıcı Performansı */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Performansı</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Toplam Kayıt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  İlk Kayıt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Son Kayıt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kullaniciStats?.map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stat.ad_soyad}</div>
                      <div className="text-sm text-gray-500">{stat.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatNumber(stat.toplam_kayit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {stat.ilk_kayit 
                        ? new Date(stat.ilk_kayit).toLocaleDateString('tr-TR')
                        : '-'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {stat.son_kayit 
                        ? new Date(stat.son_kayit).toLocaleDateString('tr-TR')
                        : '-'
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mükerrer Denemeler */}
      {mukerrerDenemeler && mukerrerDenemeler.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={24} />
              Son Mükerrer Denemeler
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    TC Kimlik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deneme Yapan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hata
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mukerrerDenemeler.map((deneme) => (
                  <tr key={deneme.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deneme.tc_kimlik_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deneme.deneme_yapan}
                    </td>
                    <td className="px-6 py-4 text-sm text-orange-600">
                      {deneme.hata_mesaji}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(deneme.deneme_tarihi).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  bgColor 
}: { 
  title: string
  value: string
  icon: React.ReactNode
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
