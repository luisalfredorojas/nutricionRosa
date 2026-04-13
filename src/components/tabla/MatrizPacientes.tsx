'use client'

import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import { columnDefs, type FichaRow } from './ColumnDefs'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MatrizPacientesProps {
  data: FichaRow[]
  globalFilter?: string
}

type ColumnMeta = { sticky?: boolean; stickyLeft?: number }

export function MatrizPacientes({ data, globalFilter = '' }: MatrizPacientesProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fecha_consulta', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const filteredData = useMemo(() => {
    if (!globalFilter.trim()) return data
    const q = globalFilter.toLowerCase()
    return data.filter(
      (row) =>
        row.nombre.toLowerCase().includes(q) ||
        (row.empresa?.toLowerCase().includes(q) ?? false)
    )
  }, [data, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns: columnDefs,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <p className="text-rosa-400 text-lg font-medium">No hay datos disponibles</p>
        <p className="text-rosa-300 text-sm mt-1">Las fichas aparecerán aquí una vez registradas</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse" style={{ minWidth: 'max-content' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined
                  const isSticky = meta?.sticky === true
                  const stickyLeft = meta?.stickyLeft ?? 0

                  return (
                    <th
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                        ...(isSticky ? { left: stickyLeft, zIndex: 20 } : {}),
                      }}
                      className={cn(
                        'px-3 py-3 text-left text-xs font-semibold text-rosa-700 uppercase tracking-wide whitespace-nowrap',
                        isSticky && 'sticky bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]'
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-1',
                            header.column.getCanSort() && 'cursor-pointer select-none hover:text-rosa-900'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-rosa-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50/60 transition-colors',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as ColumnMeta | undefined
                  const isSticky = meta?.sticky === true
                  const stickyLeft = meta?.stickyLeft ?? 0

                  return (
                    <td
                      key={cell.id}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                        ...(isSticky ? { left: stickyLeft, zIndex: 10 } : {}),
                      }}
                      className={cn(
                        'px-3 py-2.5 text-rosa-700 whitespace-nowrap',
                        isSticky && cn(
                          'sticky shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]',
                          rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        )
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50/50 text-xs text-rosa-500">
        {table.getRowModel().rows.length} de {data.length} registros
      </div>
    </div>
  )
}
