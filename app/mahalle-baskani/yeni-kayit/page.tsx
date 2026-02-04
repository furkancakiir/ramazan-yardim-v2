import { createServerSupabaseClient } from '@/lib/supabase/server'
import { YardimKayitForm } from '@/components/forms/YardimKayitForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function YeniKayitPage() {
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
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Mahalle bilgisi bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/mahalle-baskani"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft size={20} />
          Kayıtlara Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Kayıt Ekle</h1>
        <p className="text-gray-600 mt-1">Yardım alan kişi bilgilerini giriniz</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <YardimKayitForm 
          mahalleId={profile.mahalle_id} 
          mahalleName={profile.mahalleler?.ad || ''} 
        />
      </div>
    </div>
  )
}
