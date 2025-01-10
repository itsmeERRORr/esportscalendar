import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Event } from '../types/event'
import Image from 'next/image'
import { getCountryFlagUrl } from '../utils/countryFlags'
import { useMemo } from 'react'

interface NextEventBoxProps {
  events: Event[]
}

export function NextEventBox({ events }: NextEventBoxProps) {
  const nextEvents = events
    .filter(event => event.status === 'Confirmed')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const additionalEvents = nextEvents.slice(3);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB')
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    return duration;
  }

  const calculateDaysUntilEvent = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 ? daysUntil : 0;
  }

  const formatDateRange = (startDate: string, endDate: string) => {
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

  const truncateEventName = (name: string, maxLength: number) => {
    return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
  }

  const truncatedAdditionalEvents = useMemo(() => {
    return additionalEvents.map(event => ({
      ...event,
      truncatedName: truncateEventName(event.name, 20)
    }));
  }, [additionalEvents]);

  const calculateTotalWorkDays = (events: Event[]): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of the day

    return events
      .filter(event => event.status === 'Confirmed') // Filter only confirmed events
      .reduce((total, event) => {
        const endDate = new Date(event.endDate);
        endDate.setHours(0, 0, 0, 0);

        // If the event has ended, add its duration to the total
        if (endDate < today) {
          const startDate = new Date(event.startDate);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return total + duration;
        }

        return total;
      }, 0);
  };

  const calculateTravelDays = (events: Event[]): number => {
    return events
      .filter(event => event.status === 'Confirmed')
      .reduce((total, event) => {
        const endDate = new Date(event.endDate);
        endDate.setHours(0, 0, 0, 0);

        if (endDate < new Date()) {
          return total + 2; // Assumindo 1 dia para ir e 1 dia para voltar
        }
        return total;
      }, 0);
  };

  const calculateUniqueCountries = (events: Event[]): number => {
    const uniqueCountries = new Set(
      events
        .filter(event => event.status === 'Confirmed' && new Date(event.endDate) < new Date())
        .map(event => event.country)
    );
    return uniqueCountries.size;
  };

  const calculateLongestEvent = (events: Event[]): number => {
    const today = new Date();
    return events
      .filter(event => event.status === 'Confirmed' && new Date(event.endDate) < today)
      .reduce((longest, event) => {
        const duration = calculateDuration(event.startDate, event.endDate);
        return duration > longest ? duration : longest;
      }, 0);
  };

  if (nextEvents.length === 0) {
    return (
      <div className="flex space-x-4">
        <Card className="bg-gray-700 text-gray-100 border-2 border-yellow-500 h-[200px] w-[250px]">
          <CardContent className="p-2 flex flex-col justify-center items-center h-full">
            <p className="text-sm font-semibold text-yellow-300 text-center">No confirmed events yet! 😔</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-between space-x-4">
      <div className="flex space-x-4">
      {nextEvents.slice(0, 3).map((event, index) => (
        <div key={event.id} className="flex items-start">
          <Card className={`bg-gray-700 text-gray-100 border-2 border-blue-500 h-[200px] w-[250px]`}>
            <CardContent className="p-2 flex flex-col justify-between h-full">
              <div>
                <p className="text-sm font-semibold mb-1 text-blue-300">
                  {index === 0 
                    ? `Next event in ${calculateDaysUntilEvent(event.startDate)} days` 
                    : index === 1
                      ? `2nd next event in ${calculateDaysUntilEvent(event.startDate)} days`
                      : `3rd next event in ${calculateDaysUntilEvent(event.startDate)} days`}
                </p>
                <p className="text-lg font-bold mb-2 line-clamp-2">{event.name}</p>
                <p className="text-xs text-gray-400 mb-1">📍 {event.city}, {event.country}</p>
                <p className="text-xs text-gray-400 mb-1">🛫 {formatDate(event.startDate)}</p>
                <p className="text-xs text-gray-400 mb-1">🛬 {formatDate(event.endDate)}</p>
                <p className="text-xs text-gray-400">🗓️ {calculateDuration(event.startDate, event.endDate)} days in total</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      {additionalEvents.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gray-700 text-gray-100 border-2 border-blue-500 h-[60px] w-[60px] cursor-pointer">
                <CardContent className="p-2 flex flex-col justify-center items-center h-full">
                  <p className="text-sm font-semibold text-blue-300 text-center">+{additionalEvents.length}</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="bg-gray-800 text-gray-100 p-2 w-[250px]">
              {truncatedAdditionalEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between mb-2 last:mb-0">
                  <div className="flex items-center">
                    <div className="w-5 h-3 relative mr-2 flex-shrink-0">
                      <Image
                        src={getCountryFlagUrl(event.country)}
                        alt={`${event.country} flag`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs font-semibold truncate max-w-[140px]">{event.truncatedName}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 ml-2">{formatDateRange(event.startDate, event.endDate)}</p>
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      </div>
      {additionalEvents.length > 0 && (
        <Card className="bg-transparent text-gray-100 h-[200px] w-[325px] border-0">
          <CardContent className="p-2 flex flex-col justify-start items-end h-full">
            <h2 className="text-lg font-bold text-gray-100 mb-2">Ultimate Stats 📊</h2>
            <p className="text-xs text-gray-400 text-right mb-1 flex items-center justify-end">
              <span className="inline-block align-middle mr-1">📸</span>
              <span>Work Days: {calculateTotalWorkDays(events)}/365</span>
            </p>
            <p className="text-xs text-gray-400 text-right mb-1 flex items-center justify-end">
              <span className="inline-block align-middle mr-1">☁️</span>
              <span>Travel Days: {calculateTravelDays(events)}</span>
            </p>
            <p className="text-xs text-gray-400 text-right mb-1 flex items-center justify-end">
              <span className="inline-block align-middle mr-1">🌎</span>
              <span>Countries: {calculateUniqueCountries(events)}</span>
            </p>
            <p className="text-xs text-gray-400 text-right mb-1 flex items-center justify-end">
              <span className="inline-block align-middle mr-1">😢</span>
              <span>Longest AFK: {calculateLongestEvent(events)} days</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

