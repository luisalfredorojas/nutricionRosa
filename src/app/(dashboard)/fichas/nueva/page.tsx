import Link from 'next/link'
import { FichaForm } from '@/components/ficha/FichaForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function NuevaFichaPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/fichas">
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Fichas
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-rosa-800">Nueva Ficha Médica</h1>
      </div>
      <FichaForm />
    </div>
  )
}
