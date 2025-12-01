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
