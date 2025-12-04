import type { Customer, TrainingWithCustomer } from './types'

const BASE = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api'

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE}/customers`)
  if (!res.ok) throw new Error('Failed to fetch customers')
  const data = await res.json()
  return data._embedded?.customers ?? []
}

export async function fetchTrainingsWithCustomer(): Promise<TrainingWithCustomer[]> {
  const res = await fetch(`${BASE}/gettrainings`)
  if (!res.ok) throw new Error('Failed to fetch trainings')
  return await res.json()
}

export async function createCustomer(payload: Partial<Customer>) {
  const res = await fetch(`${BASE}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return await res.json()
}

export async function updateCustomer(id: string | number, payload: Partial<Customer>) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to update customer')
  return await res.json()
}

export async function deleteCustomer(id: string | number) {
  const res = await fetch(`${BASE}/customers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete customer')
  return true
}

export async function createTraining(data: { date: string; activity: string; duration: number; customerId: string | number }) {
  const body = {
    date: data.date,
    activity: data.activity,
    duration: String(data.duration),
    customer: `${BASE}/customers/${data.customerId}`,
  }
  const res = await fetch(`${BASE}/trainings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create training')
  return await res.json()
}

export async function deleteTraining(id: string | number) {
  const res = await fetch(`${BASE}/trainings/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete training')
  return true
}

export function getIdFromSelfLink(obj: any): string | null {
  const href = obj?._links?.self?.href
  if (!href) return null
  const parts = href.split('/')
  return parts[parts.length - 1]
}
