import { Event } from '../types/event'

interface EventTooltipProps {
  event: Event
}

export function EventTooltip({ event }: EventTooltipProps) {
  const isPending = event.status === 'Unpaid'
  const needsInvoice = isPending && !event.invoice
  const isPendingWithInvoice = isPending && event.invoice

  // Função para calcular o valor em EUR
  const getEurValue = () => {
    if (event.currency === 'EUR') {
      return event.budgeted;
    }
    return event.totalInEuros !== undefined ? event.totalInEuros : event.budgeted;
  }

  // Formatar o valor para exibição
  const formatCurrency = (value: number, currency: string | null | undefined) => {
    if (!currency) {
      return new Intl.NumberFormat('en-US', { style: 'decimal' }).format(value);
    }
    const currencyCode = currency === '€' ? 'EUR' : currency === '$' ? 'USD' : currency;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
  }

  const originalValue = formatCurrency(event.budgeted, event.currency || 'EUR');
  const eurValue = formatCurrency(getEurValue(), 'EUR');

  return (
    <div className="p-2 max-w-sm">
      <h3 className="font-bold text-sm mb-1">{event.name}</h3>
      <p className="text-xs mb-1"><span className="font-semibold">Client:</span> {event.client}</p>
      <p className="text-xs mb-1"><span className="font-semibold">Game:</span> {event.game}</p>
      <p className="text-xs mb-1"><span className="font-semibold">Dates:</span> {new Date(event.startDate).toLocaleDateString('en-GB')} - {new Date(event.endDate).toLocaleDateString('en-GB')}</p>
      <p className="text-xs mb-1"><span className="font-semibold">Location:</span> {event.city}, {event.country}</p>
      <p className="text-xs mb-1">
        <span className="font-semibold">Total: </span> 
        {originalValue}
        {event.currency && event.currency !== 'EUR' && event.totalInEuros !== undefined && (
          <span className="ml-1 text-gray-400">({eurValue})</span>
        )}
      </p>
      {event.observations && (
        <p className="text-xs mb-1"><span className="font-semibold">Obs:</span> {event.observations}</p>
      )}
      {needsInvoice && (
        <p className="text-xs text-yellow-300 font-semibold">⚠️ Pending invoice!</p>
      )}
      {isPendingWithInvoice && (
        <p className="text-xs text-red-300 font-semibold">❗ Pending payment!</p>
      )}
    </div>
  )
}

