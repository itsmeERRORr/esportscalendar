import { Card } from '@/components/ui/card'
import { EventBox } from './EventBox'
import { Event } from '../types/event'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface MonthBoxProps {
  month: string
  monthIndex: number
  events: Event[]
  onEventClick: (event: Event) => void
  onAddEventClick: (monthIndex: number) => void
}

export function MonthBox({ month, monthIndex, events, onEventClick, onAddEventClick }: MonthBoxProps) {
  const sortedEvents = useMemo(() => {
    return events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getMonth() === monthIndex;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, monthIndex]);

  return (
    <div className="w-full">
      <div className="flex items-center mb-2">
        <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">{month}</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-6 w-6 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-full ml-2" 
          onClick={() => onAddEventClick(monthIndex)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Card className="w-full p-3 bg-gray-800 bg-opacity-50 backdrop-blur-lg border-gray-700">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <EventBox 
              key={event.id} 
              event={event}
              onEventClick={onEventClick}
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm">No events yet. Go get them tiger!</p>
        )}
      </Card>
    </div>
  )
}

