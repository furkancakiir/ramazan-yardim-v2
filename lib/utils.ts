import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tarih formatlama
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// TC Kimlik validasyonu (client-side)
export function validateTCKimlik(tc: string): boolean {
  if (!tc || tc.length !== 11) return false
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false

  const digits = tc.split('').map(Number)
  
  let oddSum = 0
  let evenSum = 0
  
  for (let i = 0; i < 9; i += 2) {
    oddSum += digits[i]
  }
  
  for (let i = 1; i < 8; i += 2) {
    evenSum += digits[i]
  }
  
  const digit10 = ((oddSum * 7) - evenSum) % 10
  if (digit10 !== digits[9]) return false
  
  const digit11 = (oddSum + evenSum + digits[9]) % 10
  if (digit11 !== digits[10]) return false
  
  return true
}

// Telefon formatlama
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }
  
  return phone
}

// Rol etiketleri
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Yönetici',
    mahalle_baskani: 'Mahalle Başkanı',
    kullanici: 'Kullanıcı',
  }
  return labels[role] || role
}

// Sayı formatlama
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num)
}
