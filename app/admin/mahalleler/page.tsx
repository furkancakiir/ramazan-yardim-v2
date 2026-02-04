import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatNumber } from '@/lib/utils'

export default async function MahallelerPage() {
  const supabase = await createServerSupabaseClient()

  const { data: mahalleStats } = await supabase
    .from('mahalle_istatistikleri')
    .select('*')
    .order('mahalle_adi')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mahalleler</h1>
        <p className="text-gray-600 mt-1">Tüm mahalleler ve detaylı istatistikleri</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mahalleStats?.map((mahalle) => (
          <div key={mahalle.mahalle_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mahalle.mahalle_adi}</h3>
                <p className="text-sm text-gray-600">Başkan: {mahalle.mahalle_baskani_adi}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                {formatNumber(mahalle.toplam_kayit)} Kayıt
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500">Aktif Kullanıcı</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(mahalle.aktif_kullanici_sayisi)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mükerrer Deneme</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatNumber(mahalle.mukerrer_deneme_sayisi)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefon Olan</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatNumber(mahalle.telefon_olan_kayit_sayisi)}
                </p>
              </div>
            </div>

            {mahalle.son_kayit_tarihi && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Son kayıt: {new Date(mahalle.son_kayit_tarihi).toLocaleDateString('tr-TR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
