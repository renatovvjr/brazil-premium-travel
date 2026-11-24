import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, Building2, CalendarRange, LogOut, Megaphone, MessageSquare, RefreshCw, Search, Users } from 'lucide-react'
import { workspaceSupabase as supabase } from './lib/workspaceSupabase'
import { WORKSPACE_LEAD_STATUSES, canConfirmBooking, isWorkspaceAdmin, normalizeSegmentTag } from './lib/workspaceDomain'

const money = (minor = 0, currency = 'AUD') => new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(Number(minor) / 100)
const date = (value) => value ? new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(value)) : '—'
const title = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const emptyData = {
  products: [], departures: [], offers: [], customers: [], contacts: [], leads: [], interactions: [], proposals: [],
  bookings: [], passengers: [], finances: [], payments: [], refunds: [], priceSnapshots: [], agencies: [], commissions: [],
  consent: [], tags: [], marketingEligibility: [], campaigns: [], suppressions: [],
}

export default function WorkspaceV2() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data: result }) => { if (active) setSession(result.session) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setProfile(undefined)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return }
    supabase.from('profiles').select('id, role').eq('id', session.user.id).maybeSingle()
      .then(({ data: value, error: queryError }) => setProfile(!queryError && isWorkspaceAdmin(value) ? value : null))
  }, [session])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const specs = [
      ['products', 'workspace_products', 'id, code, name, category, status'],
      ['departures', 'workspace_departures', 'id, product_id, code, starts_on, ends_on, capacity, status'],
      ['offers', 'workspace_offers', 'id, departure_id, code, currency, price_minor, pricing_basis, valid_from, valid_until, status'],
      ['customers', 'crm_customers', 'id, display_name, country_of_residence, city, lifecycle_status, created_at'],
      ['contacts', 'crm_customer_contact_points', 'id, customer_id, kind, value, is_primary, active'],
      ['leads', 'crm_leads', 'id, customer_id, product_id, departure_id, agency_partner_id, marketing_campaign_id, source, campaign, status, assigned_admin_id, follow_up_at, utm_source, utm_medium, utm_term, utm_content, referrer, created_at'],
      ['interactions', 'crm_interactions', 'id, customer_id, lead_id, interaction_type, occurred_at, summary, created_at'],
      ['proposals', 'workspace_proposals', 'id, reference, lead_id, product_id, departure_id, offer_id, status, currency, quoted_price_minor, passenger_count, valid_until, notes, sent_at, accepted_at, created_at'],
      ['bookings', 'workspace_bookings', 'id, reference, customer_id, lead_id, product_id, agency_partner_id, accepted_proposal_id, status, currency, agreed_price_minor, passenger_count, booked_at, cancelled_at, cancellation_reason, created_at'],
      ['passengers', 'workspace_booking_passengers', 'id, booking_id, customer_id, display_name, passenger_type, is_lead_passenger, created_at'],
      ['finances', 'workspace_booking_financial_summary', '*'],
      ['payments', 'workspace_payments', 'id, booking_id, reference, amount_minor, currency, status, payment_method, due_on, received_at, created_at'],
      ['refunds', 'workspace_refunds', 'id, booking_id, reference, amount_minor, currency, status, reason, requested_at, completed_at'],
      ['priceSnapshots', 'workspace_booking_price_snapshots', 'id, booking_id, agreed_price_minor, currency, source, reason, created_at'],
      ['agencies', 'workspace_agency_partners', 'id, code, legal_name, trading_name, contact_name, contact_email, default_commission_bps, status'],
      ['commissions', 'workspace_agency_commissions', 'id, booking_id, agency_partner_id, commission_bps, commission_amount_minor, currency, status'],
      ['consent', 'crm_marketing_consent_events', 'id, customer_id, channel, action, source, occurred_at'],
      ['tags', 'crm_customer_tags', 'id, customer_id, tag, active, created_at'],
      ['marketingEligibility', 'crm_marketing_eligibility', 'customer_id, contact_kind, latest_consent, suppressed, eligible'],
      ['campaigns', 'workspace_marketing_campaigns', 'id, code, name, channel, status, utm_source, utm_medium, utm_campaign, starts_at, ends_at, created_at'],
      ['suppressions', 'crm_marketing_suppressions', 'id, contact_kind, normalized_value, reason, created_at, lifted_at'],
    ]
    const results = await Promise.all(specs.map(([, table, columns]) => supabase.from(table).select(columns)))
    const failed = results.find((result) => result.error)
    if (failed) setError(failed.error.message)
    else setData(Object.fromEntries(specs.map(([key], index) => [key, results[index].data || []])))
    setLoading(false)
  }, [])

  useEffect(() => { if (profile) load() }, [profile, load])

  const handleLogin = async (event) => {
    event.preventDefault(); setLoginError('')
    const { error: authError } = await supabase.auth.signInWithPassword(login)
    if (authError) setLoginError(authError.message)
  }

  if (session === undefined || (session && profile === undefined)) return <Centered>Preparing secure workspace…</Centered>
  if (!session) return <Login form={login} setForm={setLogin} error={loginError} onSubmit={handleLogin} />
  if (!profile) return <Centered><div className="text-center"><h1 className="text-3xl font-semibold">Access denied</h1><p className="mt-3 text-zinc-500">An administrator role is required.</p><button onClick={() => supabase.auth.signOut()} className="gold-button mt-6">Sign out</button></div></Centered>

  const selectedLead = data.leads.find((item) => item.id === selectedLeadId)
  const selectedBooking = data.bookings.find((item) => item.id === selectedBookingId)
  const tabs = [
    ['dashboard', 'Dashboard', BarChart3], ['leads', 'Pipeline', MessageSquare], ['customers', 'Customers', Users],
    ['catalog', 'Products & offers', CalendarRange], ['proposals', 'Proposals', BookOpen],
    ['bookings', 'Bookings & finance', BookOpen], ['agencies', 'Agency partners', Building2], ['marketing', 'Marketing', Megaphone],
  ]

  return <div className="min-h-screen bg-[#f7f5ef] text-[var(--color-deep-forest)]">
    <header className="border-b border-[var(--color-luxury-gold)]/25 bg-[var(--color-deep-forest)] text-white">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between">
        <div><p className="text-xs uppercase tracking-[.28em] text-[#f1d991]">Curated Brazil</p><h1 className="mt-2 text-3xl font-semibold">Commercial Workspace 2.0</h1></div>
        <div className="flex gap-3"><Link to="/" className="rounded-full border border-white/20 px-5 py-3 text-xs uppercase tracking-widest">Public site</Link><button onClick={() => supabase.auth.signOut()} className="gold-button"><LogOut size={15}/> Sign out</button></div>
      </div>
    </header>
    <div className="mx-auto max-w-[1500px] px-6 py-7">
      <nav className="mb-7 flex flex-wrap gap-2">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-wider ${tab === id ? 'bg-[var(--color-deep-forest)] text-white' : 'border border-[var(--color-luxury-gold)]/30 bg-white text-zinc-600'}`}><Icon size={15}/>{label}</button>)}</nav>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {tab !== 'dashboard' && <label className="relative min-w-72"><Search className="absolute left-4 top-3.5 text-zinc-400" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="field pl-11"/></label>}
        <button onClick={load} disabled={loading} className="ml-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8b6a21]"><RefreshCw size={14}/>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Workspace data is unavailable: {error}</div>}
      {tab === 'dashboard' && <Dashboard data={data}/>}
      {tab === 'leads' && <Leads data={data} search={search} open={setSelectedLeadId}/>}
      {tab === 'customers' && <Customers data={data} search={search} reload={load}/>}
      {tab === 'catalog' && <Catalog data={data} search={search} reload={load}/>}
      {tab === 'proposals' && <Proposals data={data} search={search} reload={load}/>}
      {tab === 'bookings' && <Bookings data={data} search={search} reload={load} open={setSelectedBookingId}/>}
      {tab === 'agencies' && <Agencies data={data} search={search} reload={load}/>}
      {tab === 'marketing' && <Marketing data={data} search={search} reload={load}/>}
    </div>
    {selectedLead && <LeadPanel lead={selectedLead} data={data} currentAdminId={profile.id} close={() => setSelectedLeadId(null)} reload={load}/>}
    {selectedBooking && <BookingPanel booking={selectedBooking} data={data} close={() => setSelectedBookingId(null)} reload={load}/>}
  </div>
}

function Dashboard({ data }) {
  const booked = data.leads.filter((lead) => lead.status === 'booked').length
  const totals = data.finances.reduce((sum, row) => ({ received: sum.received + Number(row.net_received_minor || 0), outstanding: sum.outstanding + Number(row.outstanding_minor || 0) }), { received: 0, outstanding: 0 })
  const refundTotal = data.refunds.filter((item) => item.status === 'completed').reduce((sum, item) => sum + Number(item.amount_minor), 0)
  const cards = [['Active leads', data.leads.filter((item) => !['booked', 'lost'].includes(item.status)).length], ['Conversion', data.leads.length ? `${Math.round(booked / data.leads.length * 100)}%` : '0%'], ['Net received', money(totals.received)], ['Outstanding', money(totals.outstanding)], ['Completed refunds', money(refundTotal)], ['Bookings', data.bookings.length]]
  return <div className="space-y-7"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value]) => <Card key={label}><p className="eyebrow">{label}</p><p className="mt-3 text-4xl font-semibold">{value}</p></Card>)}</div><Card><h2 className="text-xl font-semibold">Demand by product</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{data.products.map((product) => { const leads = data.leads.filter((item) => item.product_id === product.id); return <div key={product.id} className="rounded-2xl bg-[#f7f5ef] p-5"><p className="font-semibold">{product.name}</p><p className="mt-2 text-sm text-zinc-500">{leads.length} leads · {leads.filter((item) => item.status === 'booked').length} booked</p></div> })}</div></Card></div>
}

function Leads({ data, search, open }) {
  const rows = data.leads.filter((lead) => { const customer = byId(data.customers, lead.customer_id); const product = byId(data.products, lead.product_id); return includes(search, customer?.display_name, product?.name, lead.source, lead.status) })
  return <Table heads={['Customer', 'Product', 'Source / campaign', 'Stage', 'Follow-up', '']} rows={rows.map((lead) => [byId(data.customers, lead.customer_id)?.display_name, byId(data.products, lead.product_id)?.name, [lead.source, lead.campaign].filter(Boolean).join(' / ') || '—', title(lead.status), date(lead.follow_up_at), <button onClick={() => open(lead.id)} className="table-action">Open</button>])}/>
}

function Customers({ data, search, reload }) {
  const rows = data.customers.filter((customer) => includes(search, customer.display_name, customer.country_of_residence, customer.city))
  const recordConsent = async (customer, action) => { const { error } = await supabase.from('crm_marketing_consent_events').insert({ customer_id: customer.id, channel: 'email', action, source: 'admin_workspace' }); if (error) alert(error.message); else reload() }
  const addTag = async (customer) => { const value=window.prompt('Segment tag (letters, numbers and hyphens)'); if(!value)return; const tag=normalizeSegmentTag(value); if(!tag)return; const {error}=await supabase.from('crm_customer_tags').insert({customer_id:customer.id,tag}); if(error)alert(error.message); else reload() }
  return <Table heads={['Customer', 'Email', 'Location', 'Lifecycle', 'Segments', 'Email marketing']} rows={rows.map((customer) => {
    const email = data.contacts.find((item) => item.customer_id === customer.id && item.kind === 'email' && item.active)
    const eligibility = data.marketingEligibility.find((item)=>item.customer_id===customer.id&&item.contact_kind==='email')
    const tags = data.tags.filter((item)=>item.customer_id===customer.id&&item.active).map((item)=>item.tag)
    return [customer.display_name, email?.value || '—', [customer.city, customer.country_of_residence].filter(Boolean).join(', ') || '—', title(customer.lifecycle_status), <button onClick={()=>addTag(customer)} className="table-action">{tags.length?`${tags.join(', ')} · add`:'Add segment'}</button>, <button disabled={eligibility?.suppressed} onClick={() => recordConsent(customer, eligibility?.eligible ? 'withdrawn' : 'granted')} className="table-action disabled:cursor-not-allowed disabled:text-zinc-400">{eligibility?.suppressed ? 'Suppressed' : eligibility?.eligible ? 'Eligible · withdraw' : 'Not eligible · grant'}</button>]
  })}/>
}

function Catalog({ data, search, reload }) {
  const [departure, setDeparture] = useState({ product_id: '', code: '', starts_on: '', ends_on: '', capacity: '', status: 'open' })
  const [offer, setOffer] = useState({ departure_id: '', code: '', price: '', pricing_basis: 'per_person', status: 'active' })
  const createDeparture = async (event) => {
    event.preventDefault()
    const payload = { ...departure, capacity: departure.capacity ? Number(departure.capacity) : null, ends_on: departure.ends_on || null }
    const { error } = await supabase.from('workspace_departures').insert(payload)
    if (error) alert(error.message); else { setDeparture({ product_id: '', code: '', starts_on: '', ends_on: '', capacity: '', status: 'open' }); reload() }
  }
  const createOffer = async (event) => {
    event.preventDefault()
    const { error } = await supabase.from('workspace_offers').insert({ departure_id: offer.departure_id, code: offer.code, currency: 'AUD', price_minor: Math.round(Number(offer.price) * 100), pricing_basis: offer.pricing_basis, status: offer.status })
    if (error) alert(error.message); else { setOffer({ departure_id: '', code: '', price: '', pricing_basis: 'per_person', status: 'active' }); reload() }
  }
  const filteredDepartures = data.departures.filter((item) => includes(search, item.code, byId(data.products, item.product_id)?.name, item.status))
  const filteredOffers = data.offers.filter((item) => includes(search, item.code, byId(data.departures, item.departure_id)?.code, item.pricing_basis, item.status))
  return <div className="space-y-6">
    <div className="grid gap-6 xl:grid-cols-2">
      <Card><h2 className="text-xl font-semibold">Add departure</h2><form onSubmit={createDeparture} className="mt-4 grid gap-3 sm:grid-cols-2"><select required className="field" value={departure.product_id} onChange={(e)=>setDeparture({...departure,product_id:e.target.value})}><option value="">Product</option>{data.products.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select><input required className="field" placeholder="Departure code" value={departure.code} onChange={(e)=>setDeparture({...departure,code:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})}/><input required aria-label="Departure start date" type="date" className="field" value={departure.starts_on} onChange={(e)=>setDeparture({...departure,starts_on:e.target.value})}/><input aria-label="Departure end date" type="date" className="field" value={departure.ends_on} onChange={(e)=>setDeparture({...departure,ends_on:e.target.value})}/><input aria-label="Departure capacity" min="1" type="number" className="field" placeholder="Capacity" value={departure.capacity} onChange={(e)=>setDeparture({...departure,capacity:e.target.value})}/><button className="gold-button justify-center">Add departure</button></form></Card>
      <Card><h2 className="text-xl font-semibold">Add offer</h2><form onSubmit={createOffer} className="mt-4 grid gap-3 sm:grid-cols-2"><select required className="field" value={offer.departure_id} onChange={(e)=>setOffer({...offer,departure_id:e.target.value})}><option value="">Departure</option>{data.departures.map((item)=><option key={item.id} value={item.id}>{item.code}</option>)}</select><input required className="field" placeholder="Offer code" value={offer.code} onChange={(e)=>setOffer({...offer,code:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})}/><input required min="0" step="0.01" type="number" className="field" placeholder="Price AUD" value={offer.price} onChange={(e)=>setOffer({...offer,price:e.target.value})}/><input required className="field" placeholder="Pricing basis" value={offer.pricing_basis} onChange={(e)=>setOffer({...offer,pricing_basis:e.target.value})}/><button className="gold-button justify-center sm:col-span-2">Add offer</button></form></Card>
    </div>
    <Card><h2 className="text-xl font-semibold">Products</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{data.products.filter((item)=>includes(search,item.name,item.code,item.category)).map((item)=><div key={item.id} className="rounded-2xl bg-[#f7f5ef] p-4"><p className="font-semibold">{item.name}</p><p className="mt-2 text-xs uppercase tracking-wider text-zinc-500">{item.code} · {title(item.status)}</p></div>)}</div></Card>
    <Table heads={['Departure','Product','Dates','Capacity','Status']} rows={filteredDepartures.map((item)=>[item.code,byId(data.products,item.product_id)?.name,[date(item.starts_on),date(item.ends_on)].join(' – '),item.capacity||'—',title(item.status)])}/>
    <Table heads={['Offer','Departure','Price','Basis','Status']} rows={filteredOffers.map((item)=>[item.code,byId(data.departures,item.departure_id)?.code,money(item.price_minor,item.currency),title(item.pricing_basis),title(item.status)])}/>
  </div>
}

function Proposals({ data, search, reload }) {
  const [form, setForm] = useState({ lead_id: '', departure_id: '', offer_id: '', price: '', passenger_count: '1', valid_until: '', notes: '' })
  const create = async (event) => {
    event.preventDefault()
    const lead = byId(data.leads, form.lead_id)
    const { error } = await supabase.from('workspace_proposals').insert({ lead_id: form.lead_id, product_id: lead.product_id, departure_id: form.departure_id || lead.departure_id || null, offer_id: form.offer_id || null, status: 'draft', currency: 'AUD', quoted_price_minor: Math.round(Number(form.price) * 100), passenger_count: Number(form.passenger_count), valid_until: form.valid_until ? `${form.valid_until}T23:59:59Z` : null, notes: form.notes || null })
    if (error) alert(error.message); else { setForm({ lead_id: '', departure_id: '', offer_id: '', price: '', passenger_count: '1', valid_until: '', notes: '' }); reload() }
  }
  const changeStatus = async (proposal, status) => {
    const patch = { status }
    if (status === 'sent') patch.sent_at = new Date().toISOString()
    if (status === 'accepted') patch.accepted_at = new Date().toISOString()
    const { error } = await supabase.from('workspace_proposals').update(patch).eq('id', proposal.id)
    if (error) alert(error.message); else reload()
  }
  const rows = data.proposals.filter((item)=>includes(search,item.reference,byId(data.customers,byId(data.leads,item.lead_id)?.customer_id)?.display_name,byId(data.products,item.product_id)?.name,item.status))
  return <div className="space-y-6"><Card><h2 className="text-xl font-semibold">Create proposal</h2><form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-3"><select required className="field" value={form.lead_id} onChange={(e)=>setForm({...form,lead_id:e.target.value})}><option value="">Lead</option>{data.leads.filter((item)=>!['booked','lost'].includes(item.status)).map((item)=><option key={item.id} value={item.id}>{byId(data.customers,item.customer_id)?.display_name} — {byId(data.products,item.product_id)?.name}</option>)}</select><select className="field" value={form.departure_id} onChange={(e)=>setForm({...form,departure_id:e.target.value,offer_id:''})}><option value="">Lead/default departure</option>{data.departures.map((item)=><option key={item.id} value={item.id}>{item.code}</option>)}</select><select className="field" value={form.offer_id} onChange={(e)=>setForm({...form,offer_id:e.target.value})}><option value="">No linked offer</option>{data.offers.filter((item)=>!form.departure_id||item.departure_id===form.departure_id).map((item)=><option key={item.id} value={item.id}>{item.code} — {money(item.price_minor,item.currency)}</option>)}</select><input required min="0" step="0.01" type="number" className="field" placeholder="Quoted price AUD" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})}/><input required min="1" max="99" type="number" className="field" aria-label="Proposal passenger count" value={form.passenger_count} onChange={(e)=>setForm({...form,passenger_count:e.target.value})}/><input type="date" className="field" aria-label="Proposal valid until" value={form.valid_until} onChange={(e)=>setForm({...form,valid_until:e.target.value})}/><input className="field md:col-span-2" placeholder="Internal notes" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/><button className="gold-button justify-center">Create proposal</button></form></Card><Table heads={['Reference','Customer','Product','Quote','Passengers','Status','Action']} rows={rows.map((item)=>[item.reference,byId(data.customers,byId(data.leads,item.lead_id)?.customer_id)?.display_name,byId(data.products,item.product_id)?.name,money(item.quoted_price_minor,item.currency),item.passenger_count,title(item.status),item.status==='draft'?<button className="table-action" onClick={()=>changeStatus(item,'sent')}>Mark sent</button>:item.status==='sent'?<button className="table-action" onClick={()=>changeStatus(item,'accepted')}>Accept</button>:'—'])}/></div>
}

function Bookings({ data, search, reload, open }) {
  const [form, setForm] = useState({ leadId: '', price: '', passengers: '1' })
  const create = async (event) => { event.preventDefault(); const { error } = await supabase.rpc('workspace_create_booking', { p_lead_id: form.leadId, p_agreed_price_minor: Math.round(Number(form.price) * 100), p_passenger_count: Number(form.passengers) }); if (error) alert(error.message); else { setForm({ leadId: '', price: '', passengers: '1' }); reload() } }
  const available = data.leads.filter((lead) => !data.bookings.some((booking) => booking.lead_id === lead.id))
  const rows = data.bookings.filter((booking) => includes(search, booking.reference, byId(data.customers, booking.customer_id)?.display_name, byId(data.products, booking.product_id)?.name))
  return <div className="space-y-6"><Card><h2 className="text-xl font-semibold">Create provisional booking</h2><form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-4"><select required className="field" value={form.leadId} onChange={(e) => setForm({...form, leadId:e.target.value})}><option value="">Select lead</option>{available.map((lead) => <option key={lead.id} value={lead.id}>{byId(data.customers, lead.customer_id)?.display_name} — {byId(data.products, lead.product_id)?.name}</option>)}</select><input required min="0" step="0.01" type="number" className="field" placeholder="Agreed price AUD" value={form.price} onChange={(e) => setForm({...form, price:e.target.value})}/><input required min="1" max="99" type="number" className="field" value={form.passengers} onChange={(e) => setForm({...form, passengers:e.target.value})}/><button className="gold-button justify-center">Create booking</button></form></Card><Table heads={['Reference', 'Customer', 'Product', 'Status', 'Agreed', 'Received', 'Outstanding', '']} rows={rows.map((booking) => { const finance=data.finances.find((item)=>item.booking_id===booking.id); return [booking.reference, byId(data.customers, booking.customer_id)?.display_name, byId(data.products, booking.product_id)?.name, title(booking.status), money(booking.agreed_price_minor, booking.currency), money(finance?.net_received_minor, booking.currency), money(finance?.outstanding_minor, booking.currency), <button onClick={()=>open(booking.id)} className="table-action">Manage</button>] })}/></div>
}

function Agencies({ data, search, reload }) {
  const [form, setForm] = useState({ code:'', legal_name:'', contact_email:'', default_commission_bps:1000 })
  const create = async (event) => { event.preventDefault(); const { error } = await supabase.from('workspace_agency_partners').insert(form); if (error) alert(error.message); else { setForm({ code:'', legal_name:'', contact_email:'', default_commission_bps:1000 }); reload() } }
  const rows=data.agencies.filter((agency)=>includes(search,agency.code,agency.legal_name,agency.contact_email))
  const commissions=data.commissions.filter((item)=>includes(search,byId(data.agencies,item.agency_partner_id)?.legal_name,byId(data.bookings,item.booking_id)?.reference,item.status))
  return <div className="space-y-6"><Card><h2 className="text-xl font-semibold">Add agency partner</h2><form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-5"><input required className="field" placeholder="Code" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})}/><input required className="field" placeholder="Legal name" value={form.legal_name} onChange={(e)=>setForm({...form,legal_name:e.target.value})}/><input type="email" className="field" placeholder="Contact email" value={form.contact_email} onChange={(e)=>setForm({...form,contact_email:e.target.value})}/><input type="number" min="0" max="100" step="0.01" className="field" aria-label="Commission percent" value={form.default_commission_bps/100} onChange={(e)=>setForm({...form,default_commission_bps:Math.round(Number(e.target.value)*100)})}/><button className="gold-button justify-center">Add partner</button></form></Card><Table heads={['Code','Agency','Contact','Commission','Status']} rows={rows.map((agency)=>[agency.code,agency.trading_name||agency.legal_name,agency.contact_email||'—',`${(agency.default_commission_bps/100).toFixed(2)}%`,title(agency.status)])}/><Table heads={['Booking','Agency','Rate','Amount','Status']} rows={commissions.map((item)=>[byId(data.bookings,item.booking_id)?.reference,byId(data.agencies,item.agency_partner_id)?.trading_name||byId(data.agencies,item.agency_partner_id)?.legal_name,`${(item.commission_bps/100).toFixed(2)}%`,money(item.commission_amount_minor,item.currency),title(item.status)])}/></div>
}

function Marketing({ data, search, reload }) {
  const [campaign, setCampaign] = useState({ code: '', name: '', channel: 'email', status: 'draft', utm_source: '', utm_medium: '', utm_campaign: '' })
  const [suppression, setSuppression] = useState({ contact_kind: 'email', normalized_value: '', reason: '' })
  const createCampaign = async (event) => {
    event.preventDefault()
    const payload = Object.fromEntries(Object.entries(campaign).map(([key,value])=>[key,value||null]))
    const { error } = await supabase.from('workspace_marketing_campaigns').insert(payload)
    if (error) alert(error.message); else { setCampaign({ code: '', name: '', channel: 'email', status: 'draft', utm_source: '', utm_medium: '', utm_campaign: '' }); reload() }
  }
  const suppress = async (event) => {
    event.preventDefault()
    const payload = { ...suppression, normalized_value: suppression.normalized_value.trim().toLowerCase() }
    const { error } = await supabase.from('crm_marketing_suppressions').upsert(payload, { onConflict: 'contact_kind,normalized_value' })
    if (error) alert(error.message); else { setSuppression({ contact_kind: 'email', normalized_value: '', reason: '' }); reload() }
  }
  const lift = async (id) => {
    const { error } = await supabase.from('crm_marketing_suppressions').update({ lifted_at: new Date().toISOString() }).eq('id', id)
    if (error) alert(error.message); else reload()
  }
  const campaigns = data.campaigns.filter((item)=>includes(search,item.code,item.name,item.channel,item.status,item.utm_campaign))
  const suppressions = data.suppressions.filter((item)=>includes(search,item.normalized_value,item.reason,item.contact_kind))
  return <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-2"><Card><h2 className="text-xl font-semibold">Add campaign</h2><form onSubmit={createCampaign} className="mt-4 grid gap-3 sm:grid-cols-2"><input required className="field" placeholder="Campaign code" value={campaign.code} onChange={(e)=>setCampaign({...campaign,code:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')})}/><input required className="field" placeholder="Campaign name" value={campaign.name} onChange={(e)=>setCampaign({...campaign,name:e.target.value})}/><select className="field" value={campaign.channel} onChange={(e)=>setCampaign({...campaign,channel:e.target.value})}>{['email','search','social','partner','referral','other'].map((item)=><option key={item}>{item}</option>)}</select><select className="field" value={campaign.status} onChange={(e)=>setCampaign({...campaign,status:e.target.value})}>{['draft','active','paused','completed','archived'].map((item)=><option key={item}>{item}</option>)}</select><input className="field" placeholder="UTM source" value={campaign.utm_source} onChange={(e)=>setCampaign({...campaign,utm_source:e.target.value})}/><input className="field" placeholder="UTM medium" value={campaign.utm_medium} onChange={(e)=>setCampaign({...campaign,utm_medium:e.target.value})}/><input className="field" placeholder="UTM campaign" value={campaign.utm_campaign} onChange={(e)=>setCampaign({...campaign,utm_campaign:e.target.value})}/><button className="gold-button justify-center">Add campaign</button></form></Card><Card><h2 className="text-xl font-semibold">Suppress contact</h2><p className="mt-2 text-sm text-zinc-500">Prevents marketing eligibility even when consent was previously granted.</p><form onSubmit={suppress} className="mt-4 grid gap-3"><select className="field" value={suppression.contact_kind} onChange={(e)=>setSuppression({...suppression,contact_kind:e.target.value})}><option value="email">Email</option><option value="phone">Phone</option></select><input required className="field" placeholder="Normalized email or phone" value={suppression.normalized_value} onChange={(e)=>setSuppression({...suppression,normalized_value:e.target.value})}/><input required className="field" placeholder="Suppression reason" value={suppression.reason} onChange={(e)=>setSuppression({...suppression,reason:e.target.value})}/><button className="gold-button justify-center">Suppress contact</button></form></Card></div><Table heads={['Campaign','Channel','UTM','Status','Leads']} rows={campaigns.map((item)=>[`${item.name} · ${item.code}`,title(item.channel),[item.utm_source,item.utm_medium,item.utm_campaign].filter(Boolean).join(' / ')||'—',title(item.status),data.leads.filter((lead)=>lead.marketing_campaign_id===item.id).length])}/><Table heads={['Contact','Kind','Reason','Status','']} rows={suppressions.map((item)=>[item.normalized_value,title(item.contact_kind),item.reason,item.lifted_at?`Lifted ${date(item.lifted_at)}`:'Active',!item.lifted_at?<button className="table-action" onClick={()=>lift(item.id)}>Lift</button>:'—'])}/></div>
}

function LeadPanel({ lead, data, currentAdminId, close, reload }) {
  const [status,setStatus]=useState(lead.status); const [note,setNote]=useState(''); const [followUp,setFollowUp]=useState(lead.follow_up_at?.slice(0,10)||''); const [agencyId,setAgencyId]=useState(lead.agency_partner_id||''); const customer=byId(data.customers,lead.customer_id)
  const saveStatus=async()=>{const {error}=await supabase.rpc('workspace_change_lead_status',{p_lead_id:lead.id,p_status:status,p_reason:null});if(error){alert(error.message);return}const {error:updateError}=await supabase.from('crm_leads').update({follow_up_at:followUp?`${followUp}T09:00:00Z`:null,assigned_admin_id:currentAdminId,agency_partner_id:agencyId||null}).eq('id',lead.id);if(updateError)alert(updateError.message);else reload()}
  const addNote=async()=>{if(!note.trim())return;const {error}=await supabase.from('crm_interactions').insert({customer_id:lead.customer_id,lead_id:lead.id,interaction_type:'note',summary:note.trim()});if(error)alert(error.message);else{setNote('');reload()}}
  return <Drawer title={customer?.display_name} subtitle={byId(data.products,lead.product_id)?.name} close={close}><label className="eyebrow">Pipeline stage, follow-up and agency</label><div className="mt-2 grid gap-2 sm:grid-cols-2"><select className="field" value={status} onChange={(e)=>setStatus(e.target.value)}>{WORKSPACE_LEAD_STATUSES.map((item)=><option key={item} value={item}>{title(item)}</option>)}</select><input type="date" className="field" value={followUp} onChange={(e)=>setFollowUp(e.target.value)}/><select className="field" value={agencyId} onChange={(e)=>setAgencyId(e.target.value)}><option value="">Direct customer</option>{data.agencies.filter((item)=>item.status==='active').map((item)=><option key={item.id} value={item.id}>{item.trading_name||item.legal_name}</option>)}</select><button onClick={saveStatus} className="gold-button justify-center">Save / assign to me</button></div><label className="eyebrow mt-7 block">New interaction note</label><textarea className="field mt-2 min-h-28" value={note} onChange={(e)=>setNote(e.target.value)}/><button onClick={addNote} className="gold-button mt-3">Add to history</button><div className="mt-7 space-y-3">{data.interactions.filter((item)=>item.lead_id===lead.id).sort((a,b)=>new Date(b.occurred_at)-new Date(a.occurred_at)).map((item)=><div key={item.id} className="rounded-2xl bg-[#f7f5ef] p-4"><p className="text-sm">{item.summary}</p><p className="mt-2 text-xs text-zinc-400">{title(item.interaction_type)} · {date(item.occurred_at)}</p></div>)}</div></Drawer>
}

function BookingPanel({ booking, data, close, reload }) {
  const [payment,setPayment]=useState({reference:'',amount:'',method:'bank_transfer',dueOn:'',confirmed:false}); const [refund,setRefund]=useState({reference:'',amount:'',reason:'',completed:false}); const [passenger,setPassenger]=useState(''); const finance=data.finances.find((item)=>item.booking_id===booking.id)
  const pay=async(e)=>{e.preventDefault();const {error}=await supabase.rpc('workspace_record_manual_payment',{p_booking_id:booking.id,p_reference:payment.reference,p_amount_minor:Math.round(Number(payment.amount)*100),p_method:payment.method,p_due_on:payment.dueOn||null,p_confirm_received:payment.confirmed,p_note:null});if(error)alert(error.message);else{setPayment({reference:'',amount:'',method:'bank_transfer',dueOn:'',confirmed:false});reload()}}
  const reimburse=async(e)=>{e.preventDefault();const {error}=await supabase.rpc('workspace_record_refund',{p_booking_id:booking.id,p_reference:refund.reference,p_amount_minor:Math.round(Number(refund.amount)*100),p_reason:refund.reason,p_payment_id:null,p_completed:refund.completed,p_note:null});if(error)alert(error.message);else{setRefund({reference:'',amount:'',reason:'',completed:false});reload()}}
  const cancel=async()=>{const reason=window.prompt('Cancellation reason');if(!reason)return;const {error}=await supabase.rpc('workspace_cancel_booking',{p_booking_id:booking.id,p_reason:reason});if(error)alert(error.message);else reload()}
  const confirmPayment=async(id)=>{const {error}=await supabase.rpc('workspace_confirm_manual_payment',{p_payment_id:id});if(error)alert(error.message);else reload()}
  const completeRefund=async(id)=>{const {error}=await supabase.rpc('workspace_complete_refund',{p_refund_id:id});if(error)alert(error.message);else reload()}
  const addPassenger=async()=>{if(!passenger.trim())return;const {error}=await supabase.from('workspace_booking_passengers').insert({booking_id:booking.id,display_name:passenger.trim(),passenger_type:'adult'});if(error)alert(error.message);else{setPassenger('');reload()}}
  const confirmBooking=async()=>{const {error}=await supabase.rpc('workspace_confirm_booking',{p_booking_id:booking.id});if(error)alert(error.message);else reload()}
  const bookingPayments=data.payments.filter((item)=>item.booking_id===booking.id)
  const bookingRefunds=data.refunds.filter((item)=>item.booking_id===booking.id)
  const passengers=data.passengers.filter((item)=>item.booking_id===booking.id)
  return <Drawer title={booking.reference} subtitle={`${money(booking.agreed_price_minor,booking.currency)} · ${title(booking.status)}`} close={close}>
    <div className="grid grid-cols-2 gap-3"><Metric label="Net received" value={money(finance?.net_received_minor,booking.currency)}/><Metric label="Outstanding" value={money(finance?.outstanding_minor,booking.currency)}/></div>
    <h3 className="mt-7 font-semibold">Passengers ({passengers.length}/{booking.passenger_count})</h3>
    <div className="mt-3 space-y-2">{passengers.map((item)=><div key={item.id} className="rounded-xl bg-[#f7f5ef] p-3 text-sm">{item.display_name}{item.is_lead_passenger?' · Lead passenger':''}</div>)}</div>
    {passengers.length<booking.passenger_count&&<div className="mt-3 flex gap-2"><input className="field" placeholder="Passenger name" value={passenger} onChange={(e)=>setPassenger(e.target.value)}/><button onClick={addPassenger} className="gold-button">Add</button></div>}
    {['draft','provisional'].includes(booking.status)&&<button onClick={confirmBooking} disabled={!canConfirmBooking({status:booking.status,expectedPassengers:booking.passenger_count,actualPassengers:passengers.length})} className="gold-button mt-4">Confirm booking</button>}
    <h3 className="mt-7 font-semibold">Manual payment</h3>
    <form onSubmit={pay} className="mt-3 grid gap-3"><input required className="field" placeholder="Reference" value={payment.reference} onChange={(e)=>setPayment({...payment,reference:e.target.value})}/><input required min="0.01" step="0.01" type="number" className="field" placeholder="Amount AUD" value={payment.amount} onChange={(e)=>setPayment({...payment,amount:e.target.value})}/><input type="date" className="field" aria-label="Payment due date" value={payment.dueOn} onChange={(e)=>setPayment({...payment,dueOn:e.target.value})}/><select className="field" value={payment.method} onChange={(e)=>setPayment({...payment,method:e.target.value})}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select><label className="flex gap-2 text-sm"><input type="checkbox" checked={payment.confirmed} onChange={(e)=>setPayment({...payment,confirmed:e.target.checked})}/>Confirm manually received (not processor verified)</label><button className="gold-button justify-center">Record payment</button></form>
    <div className="mt-3 space-y-2">{bookingPayments.map((item)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f7f5ef] p-3 text-sm"><span>{item.reference} · {money(item.amount_minor,item.currency)} · {title(item.status)}</span>{item.status==='pending'&&<button onClick={()=>confirmPayment(item.id)} className="table-action">Confirm received</button>}</div>)}</div>
    <h3 className="mt-7 font-semibold">Refund</h3>
    <form onSubmit={reimburse} className="mt-3 grid gap-3"><input required className="field" placeholder="Reference" value={refund.reference} onChange={(e)=>setRefund({...refund,reference:e.target.value})}/><input required min="0.01" step="0.01" type="number" className="field" placeholder="Amount AUD" value={refund.amount} onChange={(e)=>setRefund({...refund,amount:e.target.value})}/><input required className="field" placeholder="Reason" value={refund.reason} onChange={(e)=>setRefund({...refund,reason:e.target.value})}/><label className="flex gap-2 text-sm"><input type="checkbox" checked={refund.completed} onChange={(e)=>setRefund({...refund,completed:e.target.checked})}/>Mark completed (otherwise request only)</label><button className="gold-button justify-center">Record refund</button></form>
    <div className="mt-3 space-y-2">{bookingRefunds.map((item)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-[#f7f5ef] p-3 text-sm"><span>{item.reference} · {money(item.amount_minor,item.currency)} · {title(item.status)}</span>{['requested','approved'].includes(item.status)&&<button onClick={()=>completeRefund(item.id)} className="table-action">Mark completed</button>}</div>)}</div>
    {booking.status!=='cancelled'&&<button onClick={cancel} className="mt-7 text-sm font-semibold text-red-700">Cancel booking with reason</button>}
  </Drawer>
}

const byId=(items,id)=>items.find((item)=>item.id===id)
const includes=(term,...values)=>!term||values.some((value)=>String(value||'').toLowerCase().includes(term.toLowerCase()))
const Card=({children})=><div className="rounded-[1.5rem] border border-[var(--color-luxury-gold)]/20 bg-white p-6 shadow-[0_18px_55px_rgba(24,24,27,.06)]">{children}</div>
const Metric=({label,value})=><div className="rounded-2xl bg-[#f7f5ef] p-4"><p className="eyebrow">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>
function Table({heads,rows}){return <div className="overflow-hidden rounded-[1.5rem] border border-[var(--color-luxury-gold)]/20 bg-white"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-[var(--color-deep-forest)] text-left text-xs uppercase tracking-wider text-[#f1d991]"><tr>{heads.map((head)=><th key={head} className="px-5 py-4">{head}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{rows.map((cells,index)=><tr key={index}>{cells.map((cell,i)=><td key={i} className="px-5 py-4">{cell??'—'}</td>)}</tr>)}</tbody></table></div>{!rows.length&&<p className="p-6 text-zinc-500">No matching records.</p>}</div>}
function Drawer({title,subtitle,close,children}){return <div className="fixed inset-0 z-[80] flex justify-end bg-black/55"><div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 flex items-start justify-between bg-[var(--color-deep-forest)] p-7 text-white"><div><p className="eyebrow text-[#f1d991]">Workspace record</p><h2 className="mt-2 text-3xl font-semibold">{title}</h2><p className="mt-2 text-sm text-white/60">{subtitle}</p></div><button onClick={close} className="text-2xl">×</button></div><div className="p-7">{children}</div></div></div>}
const Centered=({children})=><div className="flex min-h-screen items-center justify-center bg-[#f7f5ef] p-6 text-[#8b6a21]">{children}</div>
function Login({form,setForm,error,onSubmit}){return <Centered><form onSubmit={onSubmit} className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"><div className="bg-[var(--color-deep-forest)] p-8 text-white"><p className="eyebrow text-[#f1d991]">Curated Brazil</p><h1 className="mt-3 text-3xl font-semibold">Commercial Workspace</h1></div><div className="space-y-4 p-8"><input required type="email" className="field" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input required type="password" className="field" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/>{error&&<p className="text-sm text-red-700">{error}</p>}<button className="gold-button w-full justify-center">Sign in</button><Link to="/" className="block text-center text-xs uppercase tracking-wider text-zinc-500">Return to website</Link></div></form></Centered>}
