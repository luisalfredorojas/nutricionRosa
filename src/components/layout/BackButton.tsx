'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Volver', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) router.push(href)
    else router.back()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm text-rosa-500 hover:text-rosa-700 transition-colors mb-3 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
