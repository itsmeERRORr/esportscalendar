import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Event } from '../types/event'

interface PendingPaymentsTableProps {
  events: Event[]
}

function calculateDaysSince(date: string): number {
  const endDate = new Date(date)
  const today = new Date()
  const diffTime = today.getTime() - endDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function PendingPaymentsTable({ events }: PendingPaymentsTableProps) {
  const pendingEvents = events.filter(event => event.status === 'Unpaid')

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pending Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingEvents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5 pr-4">Event Name</TableHead>
                <TableHead className="w-1/5 px-4">Client</TableHead>
                <TableHead className="w-1/5 px-4">End Date</TableHead>
                <TableHead className="w-1/5 pl-4">Pending Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingEvents.map((event) => {
                const daysSince = calculateDaysSince(event.endDate)
                return (
                  <TableRow key={event.id}>
                    <TableCell className="pr-4 py-2">
                      <span title={event.name} className="block truncate">
                        {event.name.length > 30 ? `${event.name.substring(0, 30)}...` : event.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2">{event.client}</TableCell>
                    <TableCell className="px-4 py-2">
                      {new Date(event.endDate).toLocaleDateString('pt-PT')}
                      {daysSince > 0 && (
                        <span className="text-xs text-red-500 ml-1">
                          ↓ {daysSince} dias
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pl-4 py-2">
                      {event.currency === 'EUR' ? '€' : event.currency === 'USD' ? '$' : event.currency}{event.budgeted.toFixed(2)}
                      {event.currency !== 'EUR' && (
                        <span className="text-xs text-gray-400 ml-2">
                          (€{event.totalp !== undefined ? event.totalp.toFixed(2) : 'N/A'})
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-400">No pending payments found.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default PendingPaymentsTable;

