export interface Customer {
  firstname: string
  lastname: string
  streetaddress?: string
  postcode?: string
  city?: string
  email?: string
  phone?: string
  _links?: any
  id?: number
}

export interface TrainingWithCustomer {
  id: number
  date: string
  duration: number
  activity: string
  customer: Customer
}
