import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Building2, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  // İstatistikleri çek
  const { data: mahalleStats } = await supabase
    .from('mahalle_istatistikleri')
    .select('*')

  const { data: kullaniciStats } = await supabase
    .from('kullanici_istatistikleri')
    .select('*')

  const { count: toplamKayit } = await supabase
    .from('yardim_kayitlari')
    .select('*', { count: 'exact', head: true })

  const { count: mukerrerDenemeler } = await supabase
    .from('mukerrer_denemeler')
    .select('*', { count: 'exact', head: true })

  const toplamMahalle = mahalleStats?.length || 0
  const toplamKullanici = kullaniciStats?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Genel Bakış</h1>
        <p className="text-gray-600 mt-1">Ramazan Yardımı sistemi istatistikleri</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kayıt"
          value={formatNumber(toplamKayit || 0)}
          icon={<CheckCircle className="text-green-600" size={24} />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Mahalle Sayısı"
          value={formatNumber(toplamMahalle)}
          icon={<Building2 className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={formatNumber(toplamKullanici)}
          icon={<Users className="text-purple-600" size={24} />}
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Mükerrer Deneme"
          value={formatNumber(mukerrerDenemeler || 0)}
          icon={<AlertCircle className="text-orange-600" size={24} />}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Mahalle İstatistikleri */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Mahalle Bazlı İstatistikler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahalle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahalle Başkanı
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Kayıt
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktif Kullanıcı
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mükerrer Deneme
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mahalleStats?.map((stat) => (
                <tr key={stat.mahalle_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stat.mahalle_adi}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{stat.mahalle_baskani_adi}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatNumber(stat.toplam_kayit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-900">
                      {formatNumber(stat.aktif_kullanici_sayisi)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm text-orange-600">
                      {formatNumber(stat.mukerrer_deneme_sayisi)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* En Aktif Kullanıcılar */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">En Aktif Kullanıcılar</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mahalle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Kayıt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kullaniciStats?.slice(0, 10).map((stat) => (
                <tr key={stat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{stat.ad_soyad}</div>
                    <div className="text-sm text-gray-500">{stat.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{stat.mahalle_adi || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      stat.rol === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : stat.rol === 'mahalle_baskani'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stat.rol === 'admin' ? 'Yönetici' : stat.rol === 'mahalle_baskani' ? 'Mahalle Başkanı' : 'Kullanıcı'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {formatNumber(stat.toplam_kayit)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
