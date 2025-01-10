import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Event } from '../types/event'
import { countries } from '../utils/countries'
import { getCountryFlagUrl } from '../utils/countryFlags'
import Image from 'next/image'
import { currencies } from '@/utils/currencies'
import { motion } from 'framer-motion'
import { CalendarIcon, DollarSignIcon, MapPinIcon, BriefcaseIcon, FlagIcon } from 'lucide-react'

const scrollbarStyles = `
  .modern-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .modern-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  .modern-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    transition: background-color 0.2s ease;
  }
  .modern-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;

interface EventModalProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedEvent: Event) => void
  onDelete: (eventId: number) => void
}

export function EventModal({ event, isOpen, onClose, onUpdate, onDelete }: EventModalProps) {
  const [formData, setFormData] = useState<Event>({
    ...event,
    finalPaidAmount: event.finalPaidAmount ?? null,
    travelRate: event.travelRate ?? 0,
    conver: event.conver || 0,
    totalp: event.totalp || 0,
  })
  const [currency, setCurrency] = useState(event.currency || '€')
  const [totalInEuros, setTotalInEuros] = useState<number>(0)
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.fxratesapi.com/latest?base=EUR&currencies=USD,GBP,JPY,SEK,PLN&resolution=1m&amount=1&places=6&format=json')
        const data = await response.json()
        if (data && data.rates) {
          setExchangeRates(data.rates)
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    }
    fetchRates()
  }, [])

  useEffect(() => {
    const convertToEuros = (amount: number, fromCurrency: string) => {
      if (fromCurrency === '€' || fromCurrency === 'EUR') return amount
      const rate = exchangeRates[fromCurrency] || 1
      return amount / rate
    }

    const finalPaidAmount = formData.finalPaidAmount !== null
      ? parseFloat(formData.finalPaidAmount.toString())
      : null

    let newTotalInEuros = 0
    if (finalPaidAmount !== null && finalPaidAmount > formData.budgeted) {
      newTotalInEuros = convertToEuros(finalPaidAmount, currency)
    } else {
      newTotalInEuros = convertToEuros(formData.budgeted, currency)
    }

    setTotalInEuros(newTotalInEuros)
    setFormData(prev => ({ 
      ...prev, 
      conver: Number(newTotalInEuros.toFixed(2)),
      totalp: Number(newTotalInEuros.toFixed(2)) 
    }))
  }, [formData.budgeted, formData.finalPaidAmount, currency, exchangeRates])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'conver' || name === 'totalp') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else if (name === 'finalPaidAmount') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: 'invoice', checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, totalInEuros }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`)
      }

      const updatedEvent = await response.json()
      onUpdate(updatedEvent)
      onClose()
    } catch (error) {
      console.error('Error updating event:', error)
      alert(`Failed to update event. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        onDelete(event.id)
        onClose()
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <style jsx global>{scrollbarStyles}</style>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 w-[80vw] max-w-[800px] max-h-[85vh] overflow-y-auto p-0 rounded-lg modern-scrollbar">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_status">No status</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Contact">In Contact</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Event Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client" className="text-sm font-semibold">Client</Label>
              <Input id="client" name="client" value={formData.client} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>
            <div className="space-y-2 hidden">
              <Label htmlFor="conver" className="text-sm font-semibold">Conver</Label>
              <Input 
                id="conver" 
                name="conver" 
                type="number"
                value={formData.conver} 
                onChange={handleChange}
                className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" 
                readOnly
              />
            </div>

            <div className="space-y-2 hidden">
              <Label htmlFor="totalp" className="text-sm font-semibold">TotalP</Label>
              <Input 
                id="totalp" 
                name="totalp" 
                type="number"
                value={formData.totalp} 
                onChange={handleChange}
                className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game" className="text-sm font-semibold">Game</Label>
              <Input id="game" name="game" value={formData.game} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" /> Travel In
              </Label>
              <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" /> Travel Out
              </Label>
              <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-semibold flex items-center">
                <FlagIcon className="w-4 h-4 mr-1" /> Country
              </Label>
              <Select name="country" value={formData.country} onValueChange={(value) => handleSelectChange('country', value)}>
                <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center">
                        <Image
                          src={getCountryFlagUrl(country)}
                          alt={`${country} flag`}
                          width={16}
                          height={12}
                          className="mr-2 object-cover"
                        />
                        {country}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" /> City
              </Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelRate" className="text-sm font-semibold flex items-center">
                <DollarSignIcon className="w-4 h-4 mr-1" /> Travel Rate
              </Label>
              <Input id="travelRate" name="travelRate" type="number" value={formData.travelRate} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="text-sm font-semibold flex items-center">
                <BriefcaseIcon className="w-4 h-4 mr-1" /> Work Rate
              </Label>
              <Input id="rate" name="rate" type="number" value={formData.rate} onChange={handleChange} required className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgeted" className="text-sm font-semibold">Final Quote</Label>
              <Input id="budgeted" name="budgeted" type="number" value={formData.budgeted} onChange={handleChange} className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-semibold">Currency</Label>
              <Select name="currency" value={currency} onValueChange={(value) => {
                setCurrency(value)
                setFormData(prev => ({ ...prev, currency: value }))
              }}>
                <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">€ (EUR)</SelectItem>
                  <SelectItem value="USD">$ (USD)</SelectItem>
                  {['SEK', 'PLN'].map(rate => (
                    <SelectItem key={rate} value={rate}>{rate}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="finalPaidAmount" className="text-sm font-semibold">Final Paid Amount</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="finalPaidAmount" 
                  name="finalPaidAmount" 
                  type="number" 
                  value={formData.finalPaidAmount !== null ? formData.finalPaidAmount : ''} 
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="bg-gray-700 text-gray-100 border-gray-600 h-8 text-sm flex-grow" 
                />
                <div className="text-gray-300 text-xs">
                  Total in Euros: €{typeof totalInEuros === 'number' ? totalInEuros.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            <div className="col-span-2 flex items-center space-x-2">
              <Checkbox 
                id="invoice" 
                checked={formData.invoice} 
                onCheckedChange={(checked) => handleCheckboxChange('invoice', checked as boolean)}
              />
              <Label htmlFor="invoice" className="text-sm">Invoice</Label>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="observations" className="text-sm font-semibold">Observations</Label>
              <Textarea id="observations" name="observations" value={formData.observations} onChange={handleChange} className="bg-gray-700 text-gray-100 border-gray-600 h-20 text-sm" />
            </div>
          </motion.div>

          <DialogFooter className="flex justify-between pt-4 border-t border-gray-700">
            <Button type="button" variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1">
              Delete Event
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1">Update Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

