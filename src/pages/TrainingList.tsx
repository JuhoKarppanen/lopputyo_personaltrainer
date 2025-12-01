import React, { useEffect, useMemo, useState } from 'react'
import { fetchTrainingsWithCustomer } from '../api'
import type { TrainingWithCustomer } from '../types'
import dayjs from 'dayjs'

type SortState = { key: string | null; dir: 'asc' | 'desc' }

const columns = ['id', 'date', 'duration', 'activity', 'customer']

export default function TrainingList() {
  const [items, setItems] = useState<TrainingWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'asc' })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchTrainingsWithCustomer()
      .then((data) => {
        if (mounted) setItems(data)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    let res = items.slice()
    Object.entries(filters).forEach(([k, v]) => {
      if (!v) return
      res = res.filter((r) => {
        if (k === 'customer') {
          const name = `${r.customer?.firstname ?? ''} ${r.customer?.lastname ?? ''}`
          return name.toLowerCase().includes(v.toLowerCase())
        }
        return String((r as any)[k] ?? '').toLowerCase().includes(v.toLowerCase())
      })
    })
    if (sort.key) {
      res.sort((a: any, b: any) => {
        const A = sort.key === 'customer' ? `${a.customer?.firstname} ${a.customer?.lastname}` : a[sort.key!]
        const B = sort.key === 'customer' ? `${b.customer?.firstname} ${b.customer?.lastname}` : b[sort.key!]
        if (typeof A === 'number' && typeof B === 'number') return sort.dir === 'asc' ? A - B : B - A
        return sort.dir === 'asc' ? String(A).localeCompare(String(B)) : String(B).localeCompare(String(A))
      })
    }
    return res
  }, [items, filters, sort])

  function toggleSort(key: string) {
    setSort((s) => {
      if (s.key !== key) return { key, dir: 'asc' }
      return { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  if (loading) return <div>Loading trainings...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Trainings</h2>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} onClick={() => toggleSort(c)} style={{ cursor: 'pointer' }}>
                {c}
                {sort.key === c ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((c) => (
              <th key={c}>
                <input
                  placeholder={`Filter ${c}`}
                  value={filters[c] ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, [c]: e.target.value }))}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{dayjs(row.date).format('DD.MM.YYYY HH:mm')}</td>
              <td>{row.duration}</td>
              <td>{row.activity}</td>
              <td>{row.customer ? `${row.customer.firstname} ${row.customer.lastname}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{filtered.length} result(s)</p>
    </div>
  )
}
