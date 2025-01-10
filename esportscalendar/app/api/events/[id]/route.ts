import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: { schema: 'public' }
  }
)

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`PUT /api/events/${params.id}: Iniciando...`)
  try {
    const body = await request.json()
    console.log(`PUT /api/events/${params.id}: Corpo da requisição recebido`, body)

    // Convert camelCase to snake_case for Supabase
    const supabaseBody = {
      user_id: body.userId,
      name: body.name,
      client: body.client,
      game: body.game,
      start_date: body.startDate,
      end_date: body.endDate,
      number_of_days: body.numberOfDays,
      city: body.city,
      country: body.country,
      rate: body.rate,
      travel_rate: body.travelRate,
      budgeted: body.budgeted,
      final_paid_amount: body.finalPaidAmount === '' ? null : Number(body.finalPaidAmount),
      observations: body.observations,
      status: body.status,
      invoice: body.invoice,
      receipt: body.receipt,
      batata: body.batata,
      currency: body.currency,
      conver: body.conver ? Number(body.conver) : null,
      totalp: body.totalp,
    }

    console.log('Supabase body before update:', supabaseBody);

    const { data, error } = await supabase
      .from('events')
      .update(supabaseBody)
      .eq('id', params.id)
      .select()

    if (error) {
      console.error(`PUT /api/events/${params.id}: Erro ao atualizar no Supabase:`, error)
      return NextResponse.json({ error: `Erro ao atualizar evento no banco de dados: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error(`PUT /api/events/${params.id}: Nenhum dado retornado após a atualização`)
      return NextResponse.json({ error: 'Nenhum dado retornado após a atualização' }, { status: 500 })
    }

    // Convert snake_case back to camelCase for the frontend
    const responseData = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      client: data[0].client,
      game: data[0].game,
      startDate: data[0].start_date,
      endDate: data[0].end_date,
      numberOfDays: data[0].number_of_days,
      city: data[0].city,
      country: data[0].country,
      rate: data[0].rate,
      travelRate: data[0].travel_rate,
      budgeted: data[0].budgeted,
      finalPaidAmount: data[0].final_paid_amount,
      observations: data[0].observations,
      status: data[0].status,
      invoice: data[0].invoice,
      receipt: data[0].receipt,
      batata: data[0].batata,
      currency: data[0].currency,
      conver: data[0].conver,
      createdAt: data[0].created_at,
      totalp: data[0].totalp
    }

    console.log(`PUT /api/events/${params.id}: Evento atualizado com sucesso`, responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error(`PUT /api/events/${params.id}: Erro inesperado:`, error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`DELETE /api/events/${params.id}: Iniciando...`)
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error(`DELETE /api/events/${params.id}: Erro ao excluir no Supabase:`, error)
      return NextResponse.json({ error: `Erro ao excluir evento do banco de dados: ${error.message}` }, { status: 500 })
    }

    console.log(`DELETE /api/events/${params.id}: Evento excluído com sucesso`)
    return NextResponse.json({ message: 'Evento excluído com sucesso' })
  } catch (error) {
    console.error(`DELETE /api/events/${params.id}: Erro inesperado:`, error)
    return NextResponse.json({ error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` }, { status: 500 })
  }
}

