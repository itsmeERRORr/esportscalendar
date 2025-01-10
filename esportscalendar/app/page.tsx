'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { MonthBox } from '@/components/MonthBox'
import { AddEventModal } from '@/components/AddEventModal'
import { EventModal } from '@/components/EventModal'
import { NextEventBox } from '@/components/NextEventBox'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Event } from '../types/event'
import { MonthlyRevenueChart } from '@/components/MonthlyRevenueChart'
import PendingPaymentsTable from '@/components/PendingPaymentsTable'
import PaidEventsTable from '@/components/PaidEventsTable'

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
]

type EventStatus = 'Total' | 'Confirmed' | 'In Contact' | 'Unpaid' | 'Paid'

const getNoEventsMessage = (status: EventStatus) => {
  switch (status) {
    case 'Unpaid':
      return "No unpaid events for now.";
    case 'Paid':
      return "No paid events for now.";
    case 'Confirmed':
      return "No confirmed events for now.";
    case 'In Contact':
      return "Not in contact with events for now.";
    default:
      return "No events found.";
  }
};

export default function Home() {
  console.log('🏠 Home component rendered');
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>('Total')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)

  useEffect(() => {
    console.log('🔒 User authentication effect triggered', { user });
    if (!user) {
      router.push('/login')
    } else {
      console.log('✅ User authenticated, fetching events');
      fetchEvents();
    }
  }, [user, router]);

  const checkAndUpdateEventStatus = async (events: Event[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of the day

    const updatedEvents = events.map(event => {
      const endDate = new Date(event.endDate);
      endDate.setHours(0, 0, 0, 0);
      const oneDayAfterEnd = new Date(endDate);
      oneDayAfterEnd.setDate(oneDayAfterEnd.getDate() + 1);

      if (today >= oneDayAfterEnd && event.status === 'Confirmed') {
        return { ...event, status: 'Unpaid' };
      }
      return event;
    });

    // Update events in the database that have changed
    for (const event of updatedEvents) {
      if (event.status !== events.find(e => e.id === event.id)?.status) {
        await fetch(`/api/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      }
    }

    return updatedEvents;
  };

  const fetchEvents = async () => {
    console.log('📅 fetchEvents called');
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching events for user:', user?.id);
      
      if (!user?.id) {
        console.error('❌ No user ID available');
        setError('User ID not available');
        return;
      }

      const response = await fetch(`/api/events?userId=${user.id}`);
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Received data:', data);

      if (Array.isArray(data)) {
        console.log(`✅ Setting ${data.length} events`);
        const updatedEvents = await checkAndUpdateEventStatus(data);
        console.log('Event statuses:', updatedEvents.map(event => event.status));
        setEvents(updatedEvents);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Fetched data is not an array');
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addNewEvent = async (newEvent: Event) => {
    console.log('➕ Adding new event:', newEvent);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedEvent = await response.json();
      console.log('✅ Event saved successfully:', savedEvent);
      setEvents(prevEvents => [...prevEvents, savedEvent]);
    } catch (error) {
      console.error('❌ Error adding new event:', error);
    }
  };

  useEffect(() => {
    console.log('👤 Current user:', user)
  }, [user])

  useEffect(() => {
    console.log('Current events:', events)
  }, [events])

  console.log('🖼️ Rendering Home component', { isLoading, error, events: events.length });

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return null
  }

  const filteredEvents = selectedStatus === 'Total'
    ? events
    : events.filter(event => event.status === selectedStatus);
  console.log('Filtered events:', filteredEvents)

  const monthsWithEvents = months.filter((month, index) => {
    const monthEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === index;
    });
    return monthEvents.length > 0;
  });

  // Calculate business metrics using all events, not filtered ones
  const pendingPayments = events.filter(event => event.status === 'Unpaid').reduce((sum, event) => sum + event.budgeted, 0);
  const totalPaid = events.filter(event => event.status === 'Paid').reduce((sum, event) => sum + (event.totalp || 0), 0);
  const monthlyAverage = events.length > 0 ? totalPaid / 12 : 0;

  const getCategoryButtonClass = (status: EventStatus) => {
    switch (status) {
      case 'Total':
        return 'bg-gray-700 text-white hover:bg-gray-600';
      case 'Confirmed':
        return 'bg-green-900 text-white hover:bg-green-800';
      case 'In Contact':
        return 'bg-yellow-500 text-black hover:bg-yellow-400';
      case 'Unpaid':
        return 'bg-red-900 text-white hover:bg-red-800';
      case 'Paid':
        return 'bg-green-400 text-black hover:bg-green-300';
      default:
        return 'bg-gray-700 text-white hover:bg-gray-600';
    }
  };

  const handleAddEventClick = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen animated-gradient text-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative z-10">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Events Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  Hello, {user?.username || 'Guest'}
                </span>
                <Button onClick={logout} size="sm" variant="outline" className="hover:bg-gray-700">
                  Logout
                </Button>
              </div>
            </div>
          </header>
          <div className="mb-6">
            <NextEventBox events={events} />
          </div>
          <hr className="border-gray-600 mb-4" />
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {['Total', 'Confirmed', 'In Contact', 'Unpaid', 'Paid'].map((status) => (
                <Button
                  key={status}
                  onClick={() => setSelectedStatus(status as EventStatus)}
                  size="sm"
                  className={`font-medium ${getCategoryButtonClass(status as EventStatus)} ${
                    selectedStatus === status ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''
                  }`}
                >
                  {status}
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => setShowAddModal(true)} 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              Add New Event
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredEvents.length > 0 ? (
              months.map((month, index) => {
                const monthEvents = filteredEvents.filter(event => {
                  const eventDate = new Date(event.startDate);
                  return eventDate.getMonth() === index;
                });
                
                // Only render MonthBox if there are events for this month or if all events are shown
                if (selectedStatus === 'Total' || monthEvents.length > 0) {
                  return (
                    <MonthBox
                      key={month}
                      month={month}
                      monthIndex={index}
                      events={filteredEvents}
                      onEventClick={setSelectedEvent}
                      onAddEventClick={handleAddEventClick}
                    />
                  );
                }
                return null;
              })
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                {getNoEventsMessage(selectedStatus)}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="z-0 text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Business Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-red-400">Pending Payments</h3>
                    <p className="text-2xl font-bold text-red-400">
                      €{pendingPayments.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-400">Total Paid</h3>
                    <p className="text-2xl font-bold text-green-400">
                      €{totalPaid.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-400">Monthly Average</h3>
                    <p className="text-2xl font-bold text-blue-400">
                      €{monthlyAverage.toFixed(2)}
                    </p>
                  </div>
                </div>
                <MonthlyRevenueChart events={events} />
                <div className="mt-8">
                  <PendingPaymentsTable events={events.filter(event => event.status === 'Unpaid')} />
                </div>
                <div className="mt-8">
                  <PaidEventsTable events={events.filter(event => event.status === 'Paid')} />
                </div>
              </CardContent>
            </Card>
          </div>
          <AddEventModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false)
              setSelectedMonth(null)
            }}
            onAddEvent={addNewEvent}
            selectedMonth={selectedMonth}
          />
          {selectedEvent && (
            <EventModal
              event={selectedEvent}
              isOpen={!!selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onUpdate={(updatedEvent) => {
                setEvents(prev => prev.map(event => event.id === updatedEvent.id ? updatedEvent : event));
                setSelectedEvent(null);
              }}
              onDelete={(deletedEventId) => {
                setEvents(prev => prev.filter(event => event.id !== deletedEventId));
                setSelectedEvent(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

