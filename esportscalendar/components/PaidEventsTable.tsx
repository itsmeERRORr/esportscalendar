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

interface PaidEventsTableProps {
  events: Event[]
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  
  if (startMonth === endMonth) {
    return `${startDay}-${endDay}${startMonth}`;
  } else {
    return `${startDay}${startMonth}-${endDay}${endMonth}`;
  }
}

export function PaidEventsTable({ events }: PaidEventsTableProps) {
  const paidEvents = events.filter(event => event.status === 'Paid' && event.finalPaidAmount !== undefined)

  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle>Done Events!</CardTitle>
      </CardHeader>
      <CardContent>
        {paidEvents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-2/5 pr-4">Event name</TableHead>
                <TableHead className="w-1/5 px-4">Client</TableHead>
                <TableHead className="w-1/5 px-4">Event Dates</TableHead>
                <TableHead className="w-1/4 pl-4">(Amount Paid)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paidEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="pr-4 py-2">
                    <span title={event.name} className="block truncate">
                      {event.name.length > 30 ? `${event.name.substring(0, 30)}...` : event.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2">{event.client}</TableCell>
                  <TableCell className="px-4 py-2">{formatDateRange(event.startDate, event.endDate)}</TableCell>
                  <TableCell className="pl-4 py-2">
                    {event.currency === 'EUR' ? '€' : event.currency === 'USD' ? '$' : event.currency}{event.finalPaidAmount !== undefined ? event.finalPaidAmount.toFixed(2) : 'N/A'}
                    {event.currency !== 'EUR' && (
                      <span className="text-xs text-gray-400 ml-2">
                        (€{event.totalp !== undefined ? event.totalp.toFixed(2) : 'N/A'})
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-400">Still no events done.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default PaidEventsTable;

