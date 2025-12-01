import React, { useEffect, useMemo, useState } from 'react'
import { fetchCustomers } from '../api'
import type { Customer } from '../types'

type SortState = { key: string | null; dir: 'asc' | 'desc' }

const columns = ['firstname', 'lastname', 'email', 'phone', 'city']

export default function CustomerList() {
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'asc' })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchCustomers()
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
      res = res.filter((r) =>
        String((r as any)[k] ?? '').toLowerCase().includes(v.toLowerCase()),
      )
    })
    if (sort.key) {
      res.sort((a: any, b: any) => {
        const A = (a[sort.key!] ?? '')
        const B = (b[sort.key!] ?? '')
        if (typeof A === 'number' && typeof B === 'number') {
          return sort.dir === 'asc' ? A - B : B - A
        }
        return sort.dir === 'asc'
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A))
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

  if (loading) return <div>Loading customers...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Customers</h2>
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
          {filtered.map((row, idx) => (
            <tr key={idx}>
              <td>{row.firstname}</td>
              <td>{row.lastname}</td>
              <td>{row.email}</td>
              <td>{row.phone}</td>
              <td>{row.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{filtered.length} result(s)</p>
    </div>
  )
}
