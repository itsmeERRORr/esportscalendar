import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: { schema: 'public' }
  }
)

export async function GET(request: Request) {
  console.log('📥 GET /api/events: Received request');
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 GET /api/events: Starting fetch with userId:', userId)
    console.log('🔑 Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!userId) {
      console.warn('⚠️ No userId provided in request')
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${events?.length || 0} events for user ${userId}`)
    console.log('📊 Events:', events)

    // Ensure dates are in the correct format
    const formattedEvents = events?.map(event => ({
      id: event.id,
      userId: event.user_id,
      name: event.name,
      client: event.client,
      game: event.game,
      startDate: new Date(event.start_date).toISOString().split('T')[0],
      endDate: new Date(event.end_date).toISOString().split('T')[0],
      numberOfDays: event.number_of_days,
      city: event.city,
      country: event.country,
      rate: event.rate,
      travelRate: event.travel_rate,
      budgeted: event.budgeted,
      finalPaidAmount: event.final_paid_amount,
      observations: event.observations,
      status: event.status,
      invoice: event.invoice,
      receipt: event.receipt,
      currency: event.currency,
      batata: event.batata,
      totalp: event.totalp
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log('📥 POST /api/events: Received request');
  try {
    const body = await request.json()
    console.log('POST /api/events: Request body:', body)

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
      final_paid_amount: body.finalPaidAmount,
      observations: body.observations,
      status: body.status,
      invoice: body.invoice,
      receipt: body.receipt,
      batata: body.batata,
      currency: body.currency,
      totalp: body.totalp
    }

    console.log('POST /api/events: Formatted data for Supabase:', supabaseBody)

    const { data, error } = await supabase
      .from('events')
      .insert(supabaseBody)
      .select()

    if (error) {
      console.error('POST /api/events: Error inserting into Supabase:', error)
      return NextResponse.json({ error: `Error creating event in database: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error('POST /api/events: No data returned after insertion')
      return NextResponse.json({ error: 'No data returned after insertion' }, { status: 500 })
    }

    // Convert snake_case back to camelCase for the frontend
    const responseData = {
      id: data[0].id,
      userId: data[0].user_id,
      name: data[0].name,
      client: data[0].client,
      game: data[0].game,
      startDate: new Date(data[0].start_date).toISOString().split('T')[0],
      endDate: new Date(data[0].end_date).toISOString().split('T')[0],
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
      createdAt: data[0].created_at,
      totalp: data[0].totalp
    }

    console.log('POST /api/events: Event saved successfully', responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('POST /api/events: Unexpected error:', error)
    return NextResponse.json({ error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}

