'use client'

import { useEffect, useState } from 'react'
import {
  Scale,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { BalanzaConfig, BalanzaCampo } from '@/types/database'

type Unidad = '%' | 'kg' | 'lb'

interface CampoDraft {
  nombre_campo: string
  unidad: Unidad
}

interface BalanzaWithCampos extends BalanzaConfig {
  campos: BalanzaCampo[]
}

const UNIDADES: Unidad[] = ['%', 'kg', 'lb']

function emptyCampo(): CampoDraft {
  return { nombre_campo: '', unidad: '%' }
}

export function BalanzasManager() {
  const [balanzas, setBalanzas] = useState<BalanzaWithCampos[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New balanza
  const [newName, setNewName] = useState('')
  const [newCampos, setNewCampos] = useState<CampoDraft[]>([emptyCampo()])
  const [adding, setAdding] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editCampos, setEditCampos] = useState<CampoDraft[]>([])
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchBalanzas() {
    try {
      const res = await fetch('/api/balanzas')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Error al cargar balanzas')
        return
      }
      const data = (await res.json()) as BalanzaWithCampos[]
      setBalanzas(data)
    } catch {
      setError('Error al cargar balanzas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalanzas()
  }, [])

  async function handleAdd() {
    const nombre = newName.trim()
    if (!nombre) return

    const campos = newCampos
      .map((c) => ({ nombre_campo: c.nombre_campo.trim(), unidad: c.unidad }))
      .filter((c) => c.nombre_campo.length > 0)

    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/balanzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, campos }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Error al crear balanza')
        return
      }
      setBalanzas((prev) =>
        [...prev, body as BalanzaWithCampos].sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        )
      )
      setNewName('')
      setNewCampos([emptyCampo()])
    } catch {
      setError('Error al crear balanza')
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(id: string) {
    const nombre = editName.trim()
    if (!nombre) return

    const campos = editCampos
      .map((c) => ({ nombre_campo: c.nombre_campo.trim(), unidad: c.unidad }))
      .filter((c) => c.nombre_campo.length > 0)

    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/balanzas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, campos }),
      })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? 'Error al actualizar balanza')
        return
      }
      setBalanzas((prev) =>
        prev
          .map((b) => (b.id === id ? (body as BalanzaWithCampos) : b))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      )
      setEditingId(null)
      setEditCampos([])
    } catch {
      setError('Error al actualizar balanza')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/balanzas/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Error al eliminar balanza')
        return
      }
      setBalanzas((prev) => prev.filter((b) => b.id !== id))
    } catch {
      setError('Error al eliminar balanza')
    } finally {
      setDeletingId(null)
    }
  }

  function startEdit(balanza: BalanzaWithCampos) {
    setEditingId(balanza.id)
    setEditName(balanza.nombre)
    setEditCampos(
      balanza.campos.length > 0
        ? balanza.campos.map((c) => ({
            nombre_campo: c.nombre_campo,
            unidad: c.unidad,
          }))
        : [emptyCampo()]
    )
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditCampos([])
  }

  function updateCampoAt(
    list: CampoDraft[],
    idx: number,
    patch: Partial<CampoDraft>
  ): CampoDraft[] {
    return list.map((c, i) => (i === idx ? { ...c, ...patch } : c))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
        <Loader2 className="h-6 w-6 text-rosa-400 animate-spin mx-auto" />
        <p className="text-sm text-rosa-400 mt-2">Cargando balanzas...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <Scale className="h-5 w-5 text-rosa-500" />
        <div>
          <h2 className="font-semibold text-rosa-800 text-sm">Balanzas</h2>
          <p className="text-xs text-rosa-400">
            Configura las balanzas disponibles y sus campos personalizados
          </p>
        </div>
      </div>

      {/* Add new balanza */}
      <div className="px-5 py-4 border-b border-gray-100 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-rosa-700">Nombre de la balanza</Label>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej: Balanza InBody 270"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-rosa-700">Campos que registra</Label>
          <div className="space-y-2">
            {newCampos.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-rosa-300 shrink-0" />
                <Input
                  value={c.nombre_campo}
                  onChange={(e) =>
                    setNewCampos((prev) =>
                      updateCampoAt(prev, idx, { nombre_campo: e.target.value })
                    )
                  }
                  placeholder="Nombre del campo (ej: % Masa grasa)"
                  className="flex-1"
                />
                <Select
                  value={c.unidad}
                  onChange={(e) =>
                    setNewCampos((prev) =>
                      updateCampoAt(prev, idx, {
                        unidad: e.target.value as Unidad,
                      })
                    )
                  }
                  className="w-24"
                >
                  {UNIDADES.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setNewCampos((prev) =>
                      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
                    )
                  }
                  disabled={newCampos.length <= 1}
                  title="Quitar campo"
                >
                  <X className="h-4 w-4 text-rosa-400" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setNewCampos((prev) => [...prev, emptyCampo()])}
            className="text-rosa-600"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Agregar campo
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            size="default"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Crear balanza
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Balanzas list */}
      {balanzas.length === 0 ? (
        <div className="py-10 text-center text-rosa-300">
          <Scale className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay balanzas registradas</p>
          <p className="text-xs mt-1">Crea la primera balanza usando el formulario de arriba</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {balanzas.map((balanza) => (
            <li key={balanza.id} className="px-5 py-3">
              {editingId === balanza.id ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-rosa-700">Nombre</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-rosa-700">Campos</Label>
                    <div className="space-y-2">
                      {editCampos.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-rosa-300 shrink-0" />
                          <Input
                            value={c.nombre_campo}
                            onChange={(e) =>
                              setEditCampos((prev) =>
                                updateCampoAt(prev, idx, {
                                  nombre_campo: e.target.value,
                                })
                              )
                            }
                            placeholder="Nombre del campo"
                            className="flex-1"
                          />
                          <Select
                            value={c.unidad}
                            onChange={(e) =>
                              setEditCampos((prev) =>
                                updateCampoAt(prev, idx, {
                                  unidad: e.target.value as Unidad,
                                })
                              )
                            }
                            className="w-24"
                          >
                            {UNIDADES.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditCampos((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            title="Quitar campo"
                          >
                            <X className="h-4 w-4 text-rosa-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditCampos((prev) => [...prev, emptyCampo()])
                      }
                      className="text-rosa-600"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Agregar campo
                    </Button>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={cancelEdit} size="sm">
                      <X className="h-4 w-4 mr-1.5 text-rosa-400" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleUpdate(balanza.id)}
                      disabled={saving || !editName.trim()}
                      size="sm"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Scale className="h-4 w-4 text-rosa-300 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-rosa-800 font-medium">
                      {balanza.nombre}
                    </p>
                    {balanza.campos.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {balanza.campos.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 rounded-full bg-rosa-50 border border-rosa-100 px-2 py-0.5 text-xs text-rosa-700"
                          >
                            {c.nombre_campo}
                            <span className="text-rosa-400">({c.unidad})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-rosa-300">Sin campos configurados</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(balanza)}
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5 text-rosa-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(balanza.id)}
                    disabled={deletingId === balanza.id}
                    title="Eliminar"
                  >
                    {deletingId === balanza.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-rosa-400" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="px-5 py-3 border-t border-gray-100 text-xs text-rosa-300">
        {balanzas.length} balanza{balanzas.length !== 1 ? 's' : ''} registrada
        {balanzas.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
