'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Building2,
  UserPlus
} from 'lucide-react'
import { useState } from 'react'
import type { KullaniciProfili } from '@/types/database.types'

interface SidebarProps {
  profile: KullaniciProfili
}

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Rol bazlı navigation items
  const getNavItems = (): NavItem[] => {
    if (profile.rol === 'admin') {
      return [
        { label: 'Genel Bakış', href: '/admin', icon: <LayoutDashboard size={20} /> },
        { label: 'Mahalleler', href: '/admin/mahalleler', icon: <Building2 size={20} /> },
        { label: 'Kullanıcılar', href: '/admin/kullanicilar', icon: <Users size={20} /> },
        { label: 'Raporlar', href: '/admin/raporlar', icon: <BarChart3 size={20} /> },
      ]
    } else if (profile.rol === 'mahalle_baskani') {
      return [
        { label: 'Kayıtlar', href: '/mahalle-baskani', icon: <FileText size={20} /> },
        { label: 'Yeni Kayıt', href: '/mahalle-baskani/yeni-kayit', icon: <UserPlus size={20} /> },
        { label: 'İstatistikler', href: '/mahalle-baskani/istatistikler', icon: <BarChart3 size={20} /> },
      ]
    } else {
      return [
        { label: 'Kayıtlarım', href: '/kullanici', icon: <FileText size={20} /> },
        { label: 'Yeni Kayıt', href: '/kullanici/yeni-kayit', icon: <UserPlus size={20} /> },
      ]
    }
  }

  const navItems = getNavItems()

  const NavContent = () => (
    <>
      {/* User Info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            {profile.ad_soyad.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile.ad_soyad}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile.rol === 'admin' ? 'Yönetici' : profile.rol === 'mahalle_baskani' ? 'Mahalle Başkanı' : 'Kullanıcı'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ramazan Yardımı</h1>
          </div>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-gray-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-white">
            <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Ramazan Yardımı</h1>
              </div>
            </div>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
