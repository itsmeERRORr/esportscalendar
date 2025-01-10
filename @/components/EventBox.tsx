import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { useSpring, animated } from 'react-spring'
import { getCountryFlagUrl } from '../utils/countryFlags'
import { Event } from '../types/event'
import { PortalTooltip } from './PortalTooltip'
import { EventTooltip } from './EventTooltip'

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate || !endDate) {
    console.error('Invalid date:', { startDate, endDate })
    return 'Invalid date'
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid date:', { startDate, endDate })
    return 'Invalid date'
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const startMonth = months[start.getMonth()]
  const endMonth = months[end.getMonth()]

  if (startMonth === endMonth) {
    return `${start.getDate()}-${end.getDate()} ${startMonth}`
  } else {
    return `${start.getDate()}${startMonth}-${end.getDate()}${endMonth}`
  }
}

interface EventBoxProps {
  event: Event
  onEventClick: (event: Event) => void
}

export function EventBox({ event, onEventClick }: EventBoxProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [flagError, setFlagError] = useState(false)

  const springProps = useSpring({
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isHovered ? '0 5px 15px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
  })

  const isConfirmed = event.status === 'Confirmed'
  const isPending = event.status === 'Unpaid'
  const isInContact = event.status === 'In Contact'
  const eventEnded = new Date(event.endDate) < new Date()
  const needsInvoice = isPending && !event.invoice
  const isPendingWithInvoice = isPending && event.invoice
  const isFullyPaid = event.status === 'Paid' && event.invoice

  return (
    <PortalTooltip content={<EventTooltip event={event} />}>
      <animated.div
        style={springProps}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <Card 
          className={`w-full mb-2 transition-all duration-200 hover:bg-gray-700 ${
            isConfirmed ? 'bg-green-900/30' :
            isFullyPaid ? 'bg-green-400/30' :
            isPending ? 'bg-red-900/30' : 
            isInContact ? 'bg-yellow-500/30' :
            'bg-gray-800/50'
          } backdrop-blur-sm border-gray-600 relative`}
          onClick={() => onEventClick(event)}
        >
          <CardContent className="p-2 flex justify-between items-center">
            <div className="flex items-center w-full">
              <div className="w-5 h-3 relative mr-2 flex-shrink-0">
                <Image
                  src={getCountryFlagUrl(event.country)}
                  alt={`${event.country} flag`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setFlagError(true)}
                />
              </div>
              <p className="text-xs truncate text-gray-200 font-bold max-w-[70%]">
                {needsInvoice && <span title="Pending invoice!">⚠️ </span>}
                {isPendingWithInvoice && <span title="Pending payment!">❗ </span>}
                {isFullyPaid && <span title="Fully paid">✅ </span>}
                {event.name}
              </p>
              <span className="text-[10px] text-gray-400 ml-auto">
                {formatDateRange(event.startDate, event.endDate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </animated.div>
    </PortalTooltip>
  )
}

