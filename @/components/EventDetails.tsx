import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Event {
  id: number
  name: string
  client: string
  game: string
  startDate: string
  endDate: string
  numberOfDays: number
  city: string
  country: string
  rate: number
  budgeted: number
  vat: number
  finalPaidAmount: number
  observations: string
}

interface EventDetailsProps {
  event: Event
}

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="font-semibold">Cliente:</dt>
            <dd>{event.client}</dd>
          </div>
          <div>
            <dt className="font-semibold">Jogo:</dt>
            <dd>{event.game}</dd>
          </div>
          <div>
            <dt className="font-semibold">Data de Início:</dt>
            <dd>{event.startDate}</dd>
          </div>
          <div>
            <dt className="font-semibold">Data de Fim:</dt>
            <dd>{event.endDate}</dd>
          </div>
          <div>
            <dt className="font-semibold">Número de Dias:</dt>
            <dd>{event.numberOfDays}</dd>
          </div>
          <div>
            <dt className="font-semibold">Localização:</dt>
            <dd>{`${event.city}, ${event.country}`}</dd>
          </div>
          <div>
            <dt className="font-semibold">Rate:</dt>
            <dd>{event.rate}</dd>
          </div>
          <div>
            <dt className="font-semibold">Orçamentado:</dt>
            <dd>{event.budgeted}</dd>
          </div>
          <div>
            <dt className="font-semibold">IVA:</dt>
            <dd>{event.vat}</dd>
          </div>
          <div>
            <dt className="font-semibold">Valor Final Pago:</dt>
            <dd>{event.finalPaidAmount}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="font-semibold">Observações:</dt>
          <dd>{event.observations}</dd>
        </div>
      </CardContent>
    </Card>
  )
}

