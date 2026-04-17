export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { FichaForm } from '@/components/ficha/FichaForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface Props {
  searchParams: { tipo?: string }
}

export default function NuevaFichaPage({ searchParams }: Props) {
  const tipo = searchParams.tipo === 'privado' ? 'privado' : 'empresa'
  const backHref = tipo === 'privado' ? '/privados' : '/empresas'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            {tipo === 'privado' ? 'Privados' : 'Empresas'}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-rosa-800">Nueva Ficha Médica</h1>
      </div>
      <FichaForm defaultTipoPaciente={tipo} />
    </div>
  )
}
