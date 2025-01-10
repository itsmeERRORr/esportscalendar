export interface Event {
  id: number
  userId: number
  name: string
  client: string
  game: string
  startDate: string
  endDate: string
  numberOfDays: number
  city: string
  country: string
  rate: number
  travelRate: number
  budgeted: number
  finalPaidAmount: number | null
  observations: string
  status: string
  invoice: boolean
  receipt: boolean
  currency: string
  batata: string
  conver: number
}

