import React, { useEffect, useMemo, useState } from 'react'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, createTraining, getIdFromSelfLink } from '../api'
import type { Customer } from '../types'

type SortState = { key: string | null; dir: 'asc' | 'desc' }

const columns = ['firstname', 'lastname', 'email', 'phone', 'city']

export default function CustomerList() {
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<SortState>({ key: null, dir: 'asc' })
  const [showAdd, setShowAdd] = useState(false)
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Customer>>({})
  const [trainingFor, setTrainingFor] = useState<string | null>(null)
  const [newTraining, setNewTraining] = useState({ date: '', activity: '', duration: 60 })

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

  async function refresh() {
    setLoading(true)
    try {
      const data = await fetchCustomers()
      setItems(data)
    } catch (e: any) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

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

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createCustomer(newCustomer)
      setNewCustomer({})
      setShowAdd(false)
      await refresh()
    } catch (err: any) {
      setError(String(err))
    }
  }

  function startEdit(row: Customer) {
    const id = (row as any).id ?? getIdFromSelfLink(row)
    setEditingId(String(id))
    setEditValues({ ...row })
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    try {
      await updateCustomer(editingId, editValues)
      setEditingId(null)
      setEditValues({})
      await refresh()
    } catch (err: any) {
      setError(String(err))
    }
  }

  async function handleDelete(row: Customer) {
    const id = (row as any).id ?? getIdFromSelfLink(row)
    if (!id) return setError('Customer id not found')
    if (!confirm('Poista asiakas? Tämä poistaa myös kaikki hänen harjoituksensa.')) return
    try {
      await deleteCustomer(id)
      await refresh()
    } catch (err: any) {
      setError(String(err))
    }
  }

  function openAddTraining(row: Customer) {
    const id = (row as any).id ?? getIdFromSelfLink(row)
    if (!id) return setError('Customer id not found')
    setTrainingFor(String(id))
    setNewTraining({ date: '', activity: '', duration: 60 })
  }

  async function handleCreateTraining(e: React.FormEvent) {
    e.preventDefault()
    if (!trainingFor) return
    try {
      // date from input type datetime-local -> convert to ISO
      const iso = new Date(newTraining.date).toISOString()
      await createTraining({ date: iso, activity: newTraining.activity, duration: Number(newTraining.duration), customerId: trainingFor })
      setTrainingFor(null)
      await refresh()
    } catch (err: any) {
      setError(String(err))
    }
  }

  if (loading) return <div>Loading customers...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Customers</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setShowAdd((s) => !s)}>{showAdd ? 'Cancel' : 'Add customer'}</button>
      </div>
      {showAdd && (
        <form onSubmit={handleCreateCustomer} style={{ marginBottom: 12 }}>
          <input placeholder="Firstname" value={newCustomer.firstname ?? ''} onChange={(e) => setNewCustomer((s) => ({ ...s, firstname: e.target.value }))} />
          <input placeholder="Lastname" value={newCustomer.lastname ?? ''} onChange={(e) => setNewCustomer((s) => ({ ...s, lastname: e.target.value }))} />
          <input placeholder="Email" value={newCustomer.email ?? ''} onChange={(e) => setNewCustomer((s) => ({ ...s, email: e.target.value }))} />
          <button type="submit">Create</button>
        </form>
      )}
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
          {filtered.map((row, idx) => {
            const id = (row as any).id ?? getIdFromSelfLink(row)
            return (
              <React.Fragment key={idx}>
                <tr>
                  <td>{editingId === String(id) ? <input value={editValues.firstname ?? ''} onChange={(e) => setEditValues((v) => ({ ...v, firstname: e.target.value }))} /> : row.firstname}</td>
                  <td>{editingId === String(id) ? <input value={editValues.lastname ?? ''} onChange={(e) => setEditValues((v) => ({ ...v, lastname: e.target.value }))} /> : row.lastname}</td>
                  <td>{editingId === String(id) ? <input value={editValues.email ?? ''} onChange={(e) => setEditValues((v) => ({ ...v, email: e.target.value }))} /> : row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.city}</td>
                  <td>
                    {editingId === String(id) ? (
                      <>
                        <button onClick={handleUpdate}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(row)}>Edit</button>
                        <button onClick={() => handleDelete(row)}>Delete</button>
                        <button onClick={() => openAddTraining(row)}>Add training</button>
                      </>
                    )}
                  </td>
                </tr>
                {trainingFor === String(id) && (
                  <tr>
                    <td colSpan={7}>
                      <form onSubmit={handleCreateTraining}>
                        <label style={{ marginRight: 8 }}>Date:</label>
                        <input type="datetime-local" value={newTraining.date} onChange={(e) => setNewTraining((t) => ({ ...t, date: e.target.value }))} />
                        <input placeholder="Activity" value={newTraining.activity} onChange={(e) => setNewTraining((t) => ({ ...t, activity: e.target.value }))} />
                        <input type="number" placeholder="Duration (min)" value={String(newTraining.duration)} onChange={(e) => setNewTraining((t) => ({ ...t, duration: Number(e.target.value) }))} />
                        <button type="submit">Add</button>
                        <button type="button" onClick={() => setTrainingFor(null)}>Cancel</button>
                      </form>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
      <p>{filtered.length} result(s)</p>
    </div>
  )
}
