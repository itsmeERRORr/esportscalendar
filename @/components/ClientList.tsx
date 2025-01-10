'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClientList() {
  // Aqui você pode adicionar a lógica para buscar e exibir os clientes
  const clients = [
    { id: 1, name: 'Cliente A', lastEvent: '2023-06-10' },
    { id: 2, name: 'Cliente B', lastEvent: '2023-06-05' },
    { id: 3, name: 'Cliente C', lastEvent: '2023-06-01' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {clients.map((client) => (
            <li key={client.id} className="flex justify-between items-center">
              <span>{client.name}</span>
              <span className="text-sm text-gray-500">Último evento: {client.lastEvent}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

