'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Empresa {
  id: string
  nombre: string
  created_at: string
}

const supabase = createClient()

export function EmpresasManager() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New empresa
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchEmpresas() {
    try {
      const { data, error: err } = await supabase
        .from('empresas')
        .select('*')
        .order('nombre')

      if (err) {
        setError(err.message)
        return
      }
      setEmpresas((data as Empresa[]) ?? [])
    } catch {
      setError('Error al cargar empresas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [])

  async function handleAdd() {
    const nombre = newName.trim()
    if (!nombre) return

    setAdding(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('empresas')
        .insert({ nombre })
        .select()
        .single()

      if (err) {
        if (err.code === '23505') {
          setError('Ya existe una empresa con ese nombre')
        } else {
          setError(err.message)
        }
        return
      }
      setEmpresas((prev) =>
        [...prev, data as Empresa].sort((a, b) => a.nombre.localeCompare(b.nombre))
      )
      setNewName('')
    } catch {
      setError('Error al crear empresa')
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(id: string) {
    const nombre = editName.trim()
    if (!nombre) return

    setSaving(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('empresas')
        .update({ nombre })
        .eq('id', id)
        .select()
        .single()

      if (err) {
        if (err.code === '23505') {
          setError('Ya existe una empresa con ese nombre')
        } else {
          setError(err.message)
        }
        return
      }
      setEmpresas((prev) =>
        prev
          .map((e) => (e.id === id ? (data as Empresa) : e))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      )
      setEditingId(null)
    } catch {
      setError('Error al actualizar empresa')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)

      if (err) {
        setError(err.message)
        return
      }
      setEmpresas((prev) => prev.filter((e) => e.id !== id))
    } catch {
      setError('Error al eliminar empresa')
    } finally {
      setDeletingId(null)
    }
  }

  function startEdit(empresa: Empresa) {
    setEditingId(empresa.id)
    setEditName(empresa.nombre)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-rosa-200 p-10 text-center">
        <Loader2 className="h-6 w-6 text-rosa-400 animate-spin mx-auto" />
        <p className="text-sm text-rosa-400 mt-2">Cargando empresas...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-rosa-200 shadow-sm">
      <div className="px-5 py-4 border-b border-rosa-100 flex items-center gap-3">
        <Building2 className="h-5 w-5 text-rosa-500" />
        <div>
          <h2 className="font-semibold text-rosa-800 text-sm">Empresas</h2>
          <p className="text-xs text-rosa-400">Administra las empresas disponibles para asignar a pacientes</p>
        </div>
      </div>

      {/* Add new empresa */}
      <div className="px-5 py-4 border-b border-rosa-100">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAdd()
          }}
          className="flex gap-2"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre de la nueva empresa..."
            className="flex-1"
          />
          <Button type="submit" disabled={adding || !newName.trim()} size="default">
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Agregar
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empresas list */}
      {empresas.length === 0 ? (
        <div className="py-10 text-center text-rosa-300">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay empresas registradas</p>
          <p className="text-xs mt-1">Agrega la primera empresa usando el campo de arriba</p>
        </div>
      ) : (
        <ul className="divide-y divide-rosa-50">
          {empresas.map((empresa) => (
            <li key={empresa.id} className="px-5 py-3 flex items-center gap-3">
              {editingId === empresa.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(empresa.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdate(empresa.id)}
                    disabled={saving || !editName.trim()}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={cancelEdit}>
                    <X className="h-4 w-4 text-rosa-400" />
                  </Button>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-rosa-300 shrink-0" />
                  <span className="flex-1 text-sm text-rosa-800">{empresa.nombre}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(empresa)}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5 text-rosa-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(empresa.id)}
                    disabled={deletingId === empresa.id}
                    title="Eliminar"
                  >
                    {deletingId === empresa.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-rosa-400" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="px-5 py-3 border-t border-rosa-100 text-xs text-rosa-300">
        {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} registrada{empresas.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
