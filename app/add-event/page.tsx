'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddEvent() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    game: '',
    startDate: '',
    endDate: '',
    numberOfDays: 0,
    city: '',
    country: '',
    rate: 0,
    budgeted: 0,
    vat: 0,
    finalPaidAmount: 0,
    observations: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        router.push('/')
      } else {
        console.error('Failed to add event')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nome do Evento"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="client"
        value={formData.client}
        onChange={handleChange}
        placeholder="Cliente do Evento"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="game"
        value={formData.game}
        onChange={handleChange}
        placeholder="Jogo"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="numberOfDays"
        value={formData.numberOfDays}
        onChange={handleChange}
        placeholder="Nº Dias"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        placeholder="Cidade"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleChange}
        placeholder="País"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="rate"
        value={formData.rate}
        onChange={handleChange}
        placeholder="Rate"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="budgeted"
        value={formData.budgeted}
        onChange={handleChange}
        placeholder="Orçamentado"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="vat"
        value={formData.vat}
        onChange={handleChange}
        placeholder="IVA"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="finalPaidAmount"
        value={formData.finalPaidAmount}
        onChange={handleChange}
        placeholder="Valor Final Pago"
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="observations"
        value={formData.observations}
        onChange={handleChange}
        placeholder="Observações"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
        Adicionar Evento
      </button>
    </form>
  )
}

