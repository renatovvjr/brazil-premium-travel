import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, Building2, CalendarRange, LogOut, Megaphone, MessageSquare, RefreshCw, Search, Users } from 'lucide-react'
import { workspaceSupabase as supabase } from './lib/workspaceSupabase'
import { WORKSPACE_LEAD_STATUSES, canConfirmBooking, isWorkspaceAdmin, normalizePhone, normalizeSegmentTag } from './lib/workspaceDomain'

const money = (minor = 0, currency = 'AUD') => new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(Number(minor) / 100)
const date = (value) => value ? new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'medium', ...(value.length === 10 ? { timeZone: 'UTC' } : {}),
}).format(new Date(value)) : '—'
const title = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const emptyData = {
  products: [], departures: [], offers: [], customers: [], contacts: [], leads: [], interactions: [], proposals: [],
  bookings: [], passengers: [], finances: [], payments: [], refunds: [], priceSnapshots: [], agencies: [], commissions: [],
  consent: [], tags: [], marketingEligibility: [], campaigns: [], suppressions: [],
}

async function readRecords(table, columns) {
  const pageSize = 500
  const records = []
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from(table).select(columns)
    if (table === 'workspace_booking_financial_summary') query = query.order('booking_id')
    else if (table === 'crm_marketing_eligibility') query = query.order('contact_point_id')
    else query = query.order('id')
    const { data, error } = await query.range(offset, offset + pageSize - 1)
    if (error) return { error }
    records.push(...data)
    if (data.length < pageSize) return { data: records }
  }
}

export default function WorkspaceV2() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
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
    let active = true
    supabase.from('profiles').select('id, role').eq('id', session.user.id).maybeSingle()
      .then(({ data: value, error: queryError }) => {
        if (active) setProfile(!queryError && isWorkspaceAdmin(value) ? value : null)
      })
    return () => { active = false }
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
      ['bookings', 'workspace_bookings', 'id, reference, customer_id, lead_id, product_id, departure_id, agency_partner_id, accepted_proposal_id, status, currency, agreed_price_minor, passenger_count, booked_at, cancelled_at, cancellation_reason, created_at'],
      ['passengers', 'workspace_booking_passengers', 'id, booking_id, customer_id, display_name, passenger_type, is_lead_passenger, created_at'],
      ['finances', 'workspace_booking_financial_summary', '*'],
      ['payments', 'workspace_payments', 'id, booking_id, reference, amount_minor, currency, status, payment_method, due_on, received_at, created_at'],
      ['refunds', 'workspace_refunds', 'id, booking_id, reference, amount_minor, currency, status, reason, requested_at, completed_at'],
      ['priceSnapshots', 'workspace_booking_price_snapshots', 'id, booking_id, agreed_price_minor, currency, source, reason, created_at'],
      ['agencies', 'workspace_agency_partners', 'id, code, legal_name, trading_name, contact_name, contact_email, contact_phone, country, default_commission_bps, status, notes'],
      ['commissions', 'workspace_agency_commissions', 'id, booking_id, agency_partner_id, commission_bps, commission_amount_minor, currency, status, paid_at'],
      ['consent', 'crm_marketing_consent_events', 'id, customer_id, channel, action, source, occurred_at'],
      ['tags', 'crm_customer_tags', 'id, customer_id, tag, active, created_at'],
      ['marketingEligibility', 'crm_marketing_eligibility', 'customer_id, contact_kind, latest_consent, suppressed, eligible'],
      ['campaigns', 'workspace_marketing_campaigns', 'id, code, name, channel, status, utm_source, utm_medium, utm_campaign, starts_at, ends_at, email_subject, email_body, created_at'],
      ['suppressions', 'crm_marketing_suppressions', 'id, contact_kind, normalized_value, reason, created_at, lifted_at'],
    ]
    const results = await Promise.all(specs.map(([, table, columns]) => readRecords(table, columns)))
    const failed = results.find((result) => result.error)
    if (failed) setError(failed.error.message)
    else {
      setData(Object.fromEntries(specs.map(([key], index) => [key, results[index].data || []])))
      setLoaded(true)
    }
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
      {tab === 'dashboard' && (loaded ? <Dashboard data={data}/> : !error && <p role="status">Loading latest dashboard figures…</p>)}
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

function moneyTotal(rows, field) {
  const byCurrency = new Map()
  for (const row of rows) {
    byCurrency.set(row.currency, (byCurrency.get(row.currency) || 0) + Number(row[field] ?? 0))
  }
  return [...byCurrency].map(([currency, amount]) => money(amount, currency)).join(' · ') || money()
}

function Dashboard({ data }) {
  const [filters, setFilters] = useState({ product: '', from: '', to: '' })
  const matchesProduct = (record) => !filters.product || record.product_id === filters.product
  const inPeriod = (value) => {
    if (!filters.from && !filters.to) return true
    const day = value?.slice(0, 10)
    return day && (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
  }
  const leads = data.leads.filter((lead) => matchesProduct(lead) && inPeriod(lead.created_at))
  const bookings = data.bookings.filter((booking) => matchesProduct(booking) && inPeriod(booking.booked_at || booking.created_at))
  const activeBookings = bookings.filter((booking) => booking.status !== 'cancelled')
  const bookingIds = new Set(bookings.map((booking) => booking.id))
  const activeIds = new Set(activeBookings.map((booking) => booking.id))
  const finances = data.finances.filter((finance) => bookingIds.has(finance.booking_id))
  const convertedLeads = new Set(data.bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status)).map((booking) => booking.lead_id))
  const departures = data.departures.filter((departure) => {
    return matchesProduct(departure) && departure.starts_on &&
      new Date(departure.starts_on + 'T23:59:59').getTime() >= Date.now() &&
      ['open', 'closed'].includes(departure.status) && inPeriod(departure.starts_on)
  }).sort((a, b) => a.starts_on.localeCompare(b.starts_on))
  const cards = [
    ['Total leads', leads.length],
    ['New leads', leads.filter((lead) => lead.status === 'new').length],
    ['Follow-ups due', leads.filter((lead) => lead.follow_up_at && Date.parse(lead.follow_up_at) <= Date.now() && !['booked', 'lost'].includes(lead.status)).length],
    ['Proposals sent', data.proposals.filter((proposal) => matchesProduct(proposal) && proposal.sent_at && inPeriod(proposal.sent_at)).length],
    ['Confirmed bookings', bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status)).length],
    ['Lead conversion', leads.length ? `${(leads.filter((lead) => convertedLeads.has(lead.id)).length / leads.length * 100).toFixed(1)}%` : '—'],
    ['Total booking value', moneyTotal(activeBookings, 'agreed_price_minor')],
    ['Verified payments received', moneyTotal(finances, 'payments_minor')],
    ['Outstanding balances', moneyTotal(finances.filter((finance) => activeIds.has(finance.booking_id)), 'outstanding_minor')],
    ['Agency commissions', moneyTotal(data.commissions.filter((commission) => activeIds.has(commission.booking_id) && commission.status !== 'cancelled'), 'commission_amount_minor')],
    ['Upcoming departures', departures.length],
  ]
  return <div className="space-y-6">
    <Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <label>Product<select className="field mt-1" value={filters.product} onChange={(e) => setFilters({ ...filters, product: e.target.value })}>
          <option value="">All products</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select></label>
        <label>From<input type="date" className="field mt-1" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilters({ ...filters, from: e.target.value })}/></label>
        <label>To<input type="date" className="field mt-1" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilters({ ...filters, to: e.target.value })}/></label>
      </div>
      <p className="mt-3 text-sm text-zinc-600">Dates use lead creation, proposal sending, booking and departure dates. Finance totals are for the selected bookings.</p>
    </Card>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => <Card key={label}><p className="eyebrow">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>)}
    </div>
    <Table heads={['Upcoming departure', 'Product', 'Starts', 'Status']} rows={departures.map((departure) => [
      departure.code, byId(data.products, departure.product_id)?.name, date(departure.starts_on), title(departure.status),
    ])}/>
  </div>
}

function Leads({ data, search, open }) {
  const [stage, setStage] = useState('')
  const [product, setProduct] = useState('')
  const rows = data.leads.filter((lead) => {
    const contacts = data.contacts.filter((contact) => contact.active && contact.customer_id === lead.customer_id)
    return (!stage || stage === lead.status) && (!product || product === lead.product_id) &&
      includes(search, byId(data.customers, lead.customer_id)?.display_name, byId(data.products, lead.product_id)?.name,
        lead.source, lead.campaign, ...contacts.map((contact) => contact.value))
  }).sort((a, b) => b.created_at.localeCompare(a.created_at))
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <select className="field !w-auto" aria-label="Lead stage" value={stage} onChange={(e) => setStage(e.target.value)}>
        <option value="">All stages</option>{WORKSPACE_LEAD_STATUSES.map((status) => <option key={status} value={status}>{title(status)}</option>)}
      </select>
      <select className="field !w-auto" aria-label="Lead product" value={product} onChange={(e) => setProduct(e.target.value)}>
        <option value="">All products</option>{data.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </div>
    <Table heads={['Customer', 'Product', 'Source / campaign', 'Stage', 'Follow-up', '']} rows={rows.map((lead) => [byId(data.customers, lead.customer_id)?.display_name, byId(data.products, lead.product_id)?.name, [lead.source, lead.campaign].filter(Boolean).join(' / ') || '—', title(lead.status), date(lead.follow_up_at), <button onClick={() => open(lead.id)} className="table-action">Open</button>])}/>
  </div>
}

function Customers({ data, search, reload }) {
  const [selected, setSelected] = useState(null)
  const [segment, setSegment] = useState('')
  const rows = data.customers.filter((customer) => {
    const contacts = data.contacts.filter((contact) => contact.active && contact.customer_id === customer.id)
    return (!segment || data.tags.some((tag) => tag.active && tag.customer_id === customer.id && tag.tag === segment)) &&
      includes(search, customer.display_name, customer.country_of_residence, customer.city, ...contacts.map((contact) => contact.value))
  })
  const recordConsent = async (customer, action) => { const { error } = await supabase.from('crm_marketing_consent_events').insert({ customer_id: customer.id, channel: 'email', action, source: 'admin_workspace' }); if (error) alert(error.message); else reload() }
  const addTag = async (customer) => { const value=window.prompt('Segment tag (letters, numbers and hyphens)'); if(!value)return; const tag=normalizeSegmentTag(value); if(!tag)return; const {error}=await supabase.from('crm_customer_tags').insert({customer_id:customer.id,tag}); if(error)alert(error.message); else reload() }
  const customer = byId(data.customers, selected)
  return <div className="space-y-4">
    <select className="field !w-auto" aria-label="Customer segment" value={segment} onChange={(e) => setSegment(e.target.value)}>
      <option value="">All segments</option>{[...new Set(data.tags.filter((tag) => tag.active).map((tag) => tag.tag))].sort().map((tag) => <option key={tag}>{tag}</option>)}
    </select>
    <Table heads={['Customer', 'Email', 'Location', 'Lifecycle', 'Segments', 'Email marketing', '']} rows={rows.map((customer) => {
    const email = data.contacts.find((item) => item.customer_id === customer.id && item.kind === 'email' && item.active)
    const eligibility = data.marketingEligibility.find((item)=>item.customer_id===customer.id&&item.contact_kind==='email')
    const tags = data.tags.filter((item)=>item.customer_id===customer.id&&item.active).map((item)=>item.tag)
    return [customer.display_name, email?.value || '—', [customer.city, customer.country_of_residence].filter(Boolean).join(', ') || '—', title(customer.lifecycle_status), <button onClick={()=>addTag(customer)} className="table-action">{tags.length?`${tags.join(', ')} · add`:'Add segment'}</button>, <button disabled={!email || eligibility?.suppressed} onClick={() => {
      if (eligibility?.eligible || window.confirm('Has this customer explicitly consented to marketing email?')) recordConsent(customer, eligibility?.eligible ? 'withdrawn' : 'granted')
    }} className="table-action disabled:cursor-not-allowed disabled:text-zinc-400">{eligibility?.suppressed ? 'Suppressed' : eligibility?.eligible ? 'Eligible · withdraw' : 'Not eligible · grant'}</button>, <button className="table-action" onClick={() => setSelected(customer.id)}>Profile</button>]
  })}/>
    {customer && <CustomerPanel key={customer.id} customer={customer} data={data} reload={reload} close={() => setSelected(null)}/>}
  </div>
}

function CustomerPanel({ customer, data, reload, close }) {
  const contacts = data.contacts.filter((contact) => contact.customer_id === customer.id && contact.active)
  const bookings = data.bookings.filter((booking) => booking.customer_id === customer.id)
  const history = data.interactions.filter((item) => item.customer_id === customer.id).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
  const bookingIds = new Set(bookings.map((booking) => booking.id))
  return <Drawer title={customer.display_name} subtitle="Customer profile" close={close}>
    <RecordEditor record={customer} table="crm_customers" fields={[
      ['display_name', 'Name', 'required'], ['city', 'City'], ['country_of_residence', 'Country'],
      ['lifecycle_status', 'Lifecycle', ['lead', 'customer', 'inactive']],
    ]} reload={reload}/>
    <History title="Contact details" rows={contacts.map((contact) => `${title(contact.kind)} · ${contact.value}`)}/>
    <RecordEditor table="crm_customer_contact_points" fields={[
      ['kind', 'Type', ['email', 'phone']], ['value', 'Email or phone', 'required'],
    ]} defaults={{ kind: 'email' }} reload={reload} saveLabel="Add contact" transform={(record) => {
      const normalized = record.kind === 'phone' ? normalizePhone(record.value).normalized : record.value?.toLowerCase()
      if (!normalized || (record.kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))) throw new Error('Enter a valid contact.')
      return { ...record, customer_id: customer.id, normalized_value: normalized, is_primary: !contacts.some((contact) => contact.kind === record.kind) }
    }}/>
    <History title="Associated leads" rows={data.leads.filter((lead) => lead.customer_id === customer.id).map((lead) => `${byId(data.products, lead.product_id)?.name} · ${title(lead.status)} · ${date(lead.created_at)}`)}/>
    <History title="Bookings" rows={bookings.map((booking) => `${booking.reference} · ${title(booking.status)} · ${money(booking.agreed_price_minor, booking.currency)}`)}/>
    <History title="Payments and refunds" rows={[
      ...data.payments.filter((item) => bookingIds.has(item.booking_id)).map((item) => `${item.reference} · ${money(item.amount_minor, item.currency)} · ${title(item.status)} · ${date(item.received_at || item.due_on || item.created_at)}`),
      ...data.refunds.filter((item) => bookingIds.has(item.booking_id)).map((item) => `Refund ${item.reference} · ${money(item.amount_minor, item.currency)} · ${title(item.status)}`),
    ]}/>
    <History title="Marketing consent" rows={data.consent.filter((event) => event.customer_id === customer.id).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).map((event) => `${title(event.channel)} · ${title(event.action)} · ${date(event.occurred_at)}`)}/>
    <History title="Communication history and internal notes" rows={history.map((item) => `${title(item.interaction_type)} · ${date(item.occurred_at)} · ${item.summary}`)}/>
    <RecordEditor table="crm_interactions" fields={[
      ['interaction_type', 'Interaction type', ['note', 'email', 'phone', 'whatsapp', 'meeting']], ['summary', 'Details', 'long'],
    ]} defaults={{ interaction_type: 'note' }} reload={reload} saveLabel="Log interaction" transform={(record) => {
      if (!record.summary) throw new Error('Enter interaction details.')
      return { ...record, customer_id: customer.id }
    }}/>
  </Drawer>
}

function History({ title: heading, rows }) {
  return <section className="mt-6">
    <h3 className="font-semibold">{heading}</h3>
    {rows.length ? <ul className="mt-2 space-y-2">{rows.map((row, index) => <li key={index} className="whitespace-pre-wrap break-words rounded-xl bg-[#f7f5ef] p-3 text-sm">{row}</li>)}</ul>
      : <p className="mt-2 text-sm text-zinc-500">No records.</p>}
  </section>
}

function RecordEditor({ fields, record, table, reload, defaults = {}, transform = (values) => values, saveLabel = 'Save changes' }) {
  const initialValues = () => Object.fromEntries(fields.map(([field]) => [field, record?.[field] ?? defaults[field] ?? '']))
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const cleaned = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value).trim() || null]))
      const payload = transform(cleaned)
      const query = supabase.from(table)
      const result = record ? await query.update(payload).eq('id', record.id).select('id').single() : await query.insert(payload)
      if (result.error) throw result.error
      if (!record) setValues(initialValues())
      await reload()
    } catch (issue) {
      setError(issue.message || 'Unable to save this record.')
    } finally {
      setSaving(false)
    }
  }

  return <form onSubmit={save} className="my-4 grid gap-3 sm:grid-cols-2">
    {fields.map(([field, label, type]) => {
      const props = { className: 'field mt-1', value: values[field], onChange: (e) => setValues({ ...values, [field]: e.target.value }) }
      return <label key={field} className={type === 'long' ? 'sm:col-span-2' : ''}>
        {label}
        {Array.isArray(type) ? <select {...props} required>
          <option value="">Select {label.toLowerCase()}</option>
          {type.map((option) => {
            const [value, name] = Array.isArray(option) ? option : [option, title(option)]
            return <option key={value} value={value}>{name}</option>
          })}
        </select> : type === 'long' ? <textarea {...props} rows={3}/> :
          <input {...props} required={type === 'required'} type={typeof type === 'object' ? type.type : ['date', 'email', 'tel'].includes(type) ? type : 'text'} {...(typeof type === 'object' ? type : {})}/>}
      </label>
    })}
    {error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p>}
    <button disabled={saving} className="gold-button justify-center sm:col-span-2">{saving ? 'Saving…' : saveLabel}</button>
  </form>
}
function Catalog({ data, search, reload }) {
  const [editing, setEditing] = useState(null)
  const productOptions = data.products.map((item) => [item.id, item.name])
  const departureOptions = data.departures.map((item) => [item.id, item.code])
  const products = data.products.filter((item) => includes(search, item.code, item.name, item.category, item.status))
  const departures = data.departures.filter((item) => includes(search, item.code, byId(data.products, item.product_id)?.name, item.status))
  const offers = data.offers.filter((item) => includes(search, item.code, byId(data.departures, item.departure_id)?.code, item.pricing_basis, item.status))
  const edit = (kind, record) => <button className="table-action" onClick={() => setEditing({ kind, record })}>Edit</button>
  const configurations = {
    product: {
      table: 'workspace_products', defaults: { category: 'custom', status: 'draft' },
      fields: [['code', 'Code', 'required'], ['name', 'Product name', 'required'],
        ['category', 'Category', ['signature', 'carnaval', 'custom']], ['status', 'Status', ['draft', 'active', 'archived']]],
    },
    departure: {
      table: 'workspace_departures', defaults: { status: 'planning' },
      fields: [['code', 'Code', 'required'], ['product_id', 'Product', productOptions], ['starts_on', 'Starts', 'date'], ['ends_on', 'Ends', 'date'],
        ['capacity', 'Capacity', { type: 'number', min: 1 }], ['status', 'Availability', ['planning', 'open', 'closed', 'completed', 'cancelled']]],
    },
    offer: {
      table: 'workspace_offers', defaults: { status: 'draft', pricing_basis: 'per person, twin share', currency: 'AUD' },
      fields: [['code', 'Code', 'required'], ['departure_id', 'Departure', departureOptions],
        ['price', 'Price', { type: 'number', min: 0, step: '0.01', required: true }], ['currency', 'Currency', 'required'],
        ['pricing_basis', 'Pricing basis', 'required'], ['valid_from', 'Valid from', 'date'], ['valid_until', 'Valid until', 'date'],
        ['status', 'Status', ['draft', 'active', 'expired', 'withdrawn']]],
    },
  }
  const editor = configurations[editing?.kind]
  const record = editing?.record
  const offerRecord = editing?.kind === 'offer' && record
    ? { ...record, price: record.price_minor / 100, valid_from: record.valid_from?.slice(0, 10), valid_until: record.valid_until?.slice(0, 10) }
    : record

  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3">{Object.keys(configurations).map((kind) => <button key={kind} className="gold-button" onClick={() => setEditing({ kind })}>Add {kind}</button>)}</div>
    <Table heads={['Product / package', 'Code', 'Category', 'Status', '']} rows={products.map((item) => [
      item.name, item.code, title(item.category), title(item.status), edit('product', item),
    ])}/>
    <Table heads={['Departure', 'Product', 'Dates', 'Available places', 'Status', '']} rows={departures.map((item) => {
      const reserved = data.bookings.filter((booking) => booking.departure_id === item.id && ['provisional', 'confirmed', 'completed'].includes(booking.status))
        .reduce((count, booking) => count + booking.passenger_count, 0)
      return [item.code, byId(data.products, item.product_id)?.name, [date(item.starts_on), date(item.ends_on)].join(' – '),
        item.capacity == null ? 'Not set' : Math.max(item.capacity - reserved, 0) + ' / ' + item.capacity,
        title(item.status), edit('departure', item)]
    })}/>
    <Table heads={['Offer', 'Departure', 'Price', 'Basis', 'Status', '']} rows={offers.map((item) => [
      item.code, byId(data.departures, item.departure_id)?.code, money(item.price_minor, item.currency), item.pricing_basis, title(item.status), edit('offer', item),
    ])}/>
    {editor && <Drawer title={(record ? 'Edit ' : 'Add ') + editing.kind} subtitle={record?.code} close={() => setEditing(null)}>
      <RecordEditor key={editing.kind + (record?.id || 'new')} record={offerRecord} {...editor}
        reload={async () => { await reload(); setEditing(null) }}
        transform={({ price, ...values }) => {
          const normalized = { ...values, code: values.code?.toLowerCase() }
          if (editing.kind !== 'offer') return normalized
          const currency = normalized.currency?.toUpperCase()
          if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Enter a three-letter currency code.')
          return { ...normalized, currency, price_minor: Math.round(Number(price) * 100),
            valid_until: normalized.valid_until ? normalized.valid_until + 'T23:59:59Z' : null }
        }}/>
    </Drawer>}
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
  const available = data.leads.filter((lead) => lead.status !== 'lost' && !data.bookings.some((booking) => booking.lead_id === lead.id && booking.status !== 'cancelled'))
  const rows = data.bookings.filter((booking) => includes(search, booking.reference, byId(data.customers, booking.customer_id)?.display_name, byId(data.products, booking.product_id)?.name))
  return <div className="space-y-6"><Card><h2 className="text-xl font-semibold">Create provisional booking</h2><form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-4"><select required className="field" value={form.leadId} onChange={(e) => setForm({...form, leadId:e.target.value})}><option value="">Select lead</option>{available.map((lead) => <option key={lead.id} value={lead.id}>{byId(data.customers, lead.customer_id)?.display_name} — {byId(data.products, lead.product_id)?.name}</option>)}</select><input required min="0" step="0.01" type="number" className="field" placeholder="Agreed price AUD" value={form.price} onChange={(e) => setForm({...form, price:e.target.value})}/><input required min="1" max="99" type="number" className="field" value={form.passengers} onChange={(e) => setForm({...form, passengers:e.target.value})}/><button className="gold-button justify-center">Create booking</button></form></Card><Table heads={['Reference', 'Customer', 'Product', 'Status', 'Agreed', 'Received', 'Outstanding', '']} rows={rows.map((booking) => { const finance=data.finances.find((item)=>item.booking_id===booking.id); return [booking.reference, byId(data.customers, booking.customer_id)?.display_name, byId(data.products, booking.product_id)?.name, title(booking.status), money(booking.agreed_price_minor, booking.currency), money(finance?.net_received_minor, booking.currency), money(finance?.outstanding_minor, booking.currency), <button onClick={()=>open(booking.id)} className="table-action">Manage</button>] })}/></div>
}

function Agencies({ data, search, reload }) {
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('')
  const partner = byId(data.agencies, selectedId)
  const partners = data.agencies.filter((item) => includes(search, item.code, item.legal_name, item.contact_email, item.country))
  const commissions = data.commissions.filter((item) => (!filter || item.agency_partner_id === filter) &&
    includes(search, byId(data.agencies, item.agency_partner_id)?.legal_name, byId(data.bookings, item.booking_id)?.reference, item.status))

  async function reconcile(item, status) {
    const paid_at = status === 'paid' ? new Date().toISOString() : null
    const { error } = await supabase.from('workspace_agency_commissions')
      .update({ status, paid_at }).eq('id', item.id).eq('status', item.status).select('id').single()
    if (error) alert(error.message)
    else reload()
  }

  return <div className="space-y-6">
    <button className="gold-button" onClick={() => setSelectedId('new')}>Add agency partner</button>
    <Table heads={['Code', 'Agency', 'Contact', 'Rate', 'Status', 'Referrals', 'Bookings', '']} rows={partners.map((item) => [
      item.code, item.trading_name || item.legal_name, [item.contact_name, item.contact_email, item.contact_phone].filter(Boolean).join(' · '),
      (item.default_commission_bps / 100).toFixed(2) + '%', title(item.status),
      data.leads.filter((lead) => lead.agency_partner_id === item.id).length,
      data.bookings.filter((booking) => booking.agency_partner_id === item.id).length,
      <button className="table-action" onClick={() => setSelectedId(item.id)}>Manage</button>,
    ])}/>
    <select className="field !w-auto" aria-label="Commission agency" value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="">Commissions for all agencies</option>{data.agencies.map((item) => <option key={item.id} value={item.id}>{item.legal_name}</option>)}
    </select>
    <Table heads={['Booking', 'Agency', 'Rate snapshot', 'Amount', 'Payment status', 'Paid date']} rows={commissions.map((item) => [
      byId(data.bookings, item.booking_id)?.reference, byId(data.agencies, item.agency_partner_id)?.legal_name,
      (item.commission_bps / 100).toFixed(2) + '%', money(item.commission_amount_minor, item.currency),
      <select className="field" aria-label="Commission status" value={item.status} onChange={(e) => reconcile(item, e.target.value)}>
        {['estimated', 'approved', 'payable', 'paid', 'cancelled'].map((status) => <option key={status} value={status}>{title(status)}</option>)}
      </select>, date(item.paid_at),
    ])}/>
    {selectedId && <Drawer title={partner?.legal_name || 'New agency'} subtitle="Referral and commission settings" close={() => setSelectedId(null)}>
      <RecordEditor key={selectedId} record={partner && { ...partner, commission: partner.default_commission_bps / 100 }} table="workspace_agency_partners" fields={[
        ['code', 'Referral code', 'required'], ['legal_name', 'Agency name', 'required'], ['trading_name', 'Trading name'],
        ['contact_name', 'Contact person'], ['contact_email', 'Email', 'email'], ['contact_phone', 'Telephone', 'tel'],
        ['country', 'Country'], ['status', 'Partner status', ['prospect', 'active', 'suspended', 'inactive']],
        ['commission', 'Commission percentage', { type: 'number', min: 0, max: 100, step: '0.01', required: true }],
        ['notes', 'Internal notes', 'long'],
      ]} defaults={{ status: 'active' }} reload={async () => { await reload(); setSelectedId(null) }} transform={({ commission, ...values }) => ({
        ...values, code: values.code?.toLowerCase(), default_commission_bps: Math.round(Number(commission) * 100),
      })}/>
      {partner && <>
        <History title="Referred leads" rows={data.leads.filter((lead) => lead.agency_partner_id === partner.id).map((lead) =>
          [byId(data.customers, lead.customer_id)?.display_name, byId(data.products, lead.product_id)?.name, title(lead.status)].join(' · '))}/>
        <History title="Associated bookings" rows={data.bookings.filter((booking) => booking.agency_partner_id === partner.id).map((booking) =>
          [booking.reference, title(booking.status), money(booking.agreed_price_minor, booking.currency)].join(' · '))}/>
      </>}
    </Drawer>}
  </div>
}

function Marketing({ data, search, reload }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const campaign = byId(data.campaigns, selectedCampaign)
  const [suppression, setSuppression] = useState({ contact_kind: 'email', normalized_value: '', reason: '' })
  const suppress = async (event) => {
    event.preventDefault()
    const payload = { ...suppression, normalized_value: suppression.contact_kind === 'phone' ? normalizePhone(suppression.normalized_value).normalized : suppression.normalized_value.trim().toLowerCase(), lifted_at: null }
    if (!payload.normalized_value) return alert('Enter a valid contact.')
    const { error } = await supabase.from('crm_marketing_suppressions').upsert(payload, { onConflict: 'contact_kind,normalized_value' })
    if (error) alert(error.message); else { setSuppression({ contact_kind: 'email', normalized_value: '', reason: '' }); reload() }
  }
  const lift = async (id) => {
    const { error } = await supabase.from('crm_marketing_suppressions').update({ lifted_at: new Date().toISOString() }).eq('id', id)
    if (error) alert(error.message); else reload()
  }
  const campaigns = data.campaigns.filter((item)=>includes(search,item.code,item.name,item.channel,item.status,item.utm_campaign))
  const suppressions = data.suppressions.filter((item)=>includes(search,item.normalized_value,item.reason,item.contact_kind))
  return <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-2"><Card><button className="gold-button" onClick={() => setSelectedCampaign('new')}>Add campaign</button>
    {selectedCampaign && <Drawer title={campaign?.name || 'New campaign'} subtitle="Attribution and email drafts" close={() => setSelectedCampaign(null)}>
      <RecordEditor key={selectedCampaign} record={campaign} table="workspace_marketing_campaigns" fields={[
        ['code', 'Campaign code', 'required'], ['name', 'Name', 'required'],
        ['channel', 'Channel', ['email', 'search', 'social', 'partner', 'referral', 'other']],
        ['status', 'Status', ['draft', 'active', 'paused', 'completed', 'archived']],
        ['utm_source', 'UTM source'], ['utm_medium', 'UTM medium'], ['utm_campaign', 'UTM campaign'],
        ['email_subject', 'Draft subject'], ['email_body', 'Draft body', 'long'],
      ]} defaults={{ channel: 'email', status: 'draft' }} reload={async () => { await reload(); setSelectedCampaign(null) }}
      transform={(values) => ({ ...values, code: values.code?.toLowerCase() })}/>
    </Drawer>}</Card><Card><h2 className="text-xl font-semibold">Suppress contact</h2><p className="mt-2 text-sm text-zinc-500">Prevents marketing eligibility even when consent was previously granted.</p><form onSubmit={suppress} className="mt-4 grid gap-3"><select className="field" value={suppression.contact_kind} onChange={(e)=>setSuppression({...suppression,contact_kind:e.target.value})}><option value="email">Email</option><option value="phone">Phone</option></select><input required className="field" placeholder="Normalized email or phone" value={suppression.normalized_value} onChange={(e)=>setSuppression({...suppression,normalized_value:e.target.value})}/><input required className="field" placeholder="Suppression reason" value={suppression.reason} onChange={(e)=>setSuppression({...suppression,reason:e.target.value})}/><button className="gold-button justify-center">Suppress contact</button></form></Card></div><Table heads={['Campaign','Channel','UTM','Status','Leads','Confirmed bookings','']} rows={campaigns.map((item)=>[`${item.name} · ${item.code}`,title(item.channel),[item.utm_source,item.utm_medium,item.utm_campaign].filter(Boolean).join(' / ')||'—',title(item.status),data.leads.filter((lead)=>lead.marketing_campaign_id===item.id).length,
      data.bookings.filter((booking) => ['confirmed', 'completed'].includes(booking.status) &&
        byId(data.leads, booking.lead_id)?.marketing_campaign_id === item.id).length,
      <button className="table-action" onClick={() => setSelectedCampaign(item.id)}>Manage</button>])}/><Table heads={['Contact','Kind','Reason','Status','']} rows={suppressions.map((item)=>[item.normalized_value,title(item.contact_kind),item.reason,item.lifted_at?`Lifted ${date(item.lifted_at)}`:'Active',!item.lifted_at?<button className="table-action" onClick={()=>lift(item.id)}>Lift</button>:'—'])}/></div>
}

function LeadPanel({ lead, data, currentAdminId, close, reload }) {
  const [status,setStatus]=useState(lead.status); const [note,setNote]=useState(''); const [followUp,setFollowUp]=useState(lead.follow_up_at?.slice(0,10)||''); const [agencyId,setAgencyId]=useState(lead.agency_partner_id||''); const customer=byId(data.customers,lead.customer_id)
  const saveStatus=async()=>{const {error}=await supabase.from('crm_leads').update({status,follow_up_at:followUp?`${followUp}T09:00:00Z`:null,assigned_admin_id:currentAdminId,agency_partner_id:agencyId||null}).eq('id',lead.id).select('id').single();if(error)alert(error.message);else reload()}
  const addNote=async()=>{if(!note.trim())return;const {error}=await supabase.from('crm_interactions').insert({customer_id:lead.customer_id,lead_id:lead.id,interaction_type:'note',summary:note.trim()});if(error)alert(error.message);else{setNote('');reload()}}
  const repeatEnquiries = data.leads.filter((item) => item.customer_id === lead.customer_id && item.product_id === lead.product_id && item.id !== lead.id)
  return <Drawer title={customer?.display_name} subtitle={byId(data.products,lead.product_id)?.name} close={close}>
    <History title="Contact details" rows={data.contacts.filter((contact) => contact.active && contact.customer_id === lead.customer_id).map((contact) => `${title(contact.kind)} · ${contact.value}`)}/>
    <History title="Attribution" rows={[
      lead.source && `Source: ${lead.source}`, lead.campaign && `Campaign: ${lead.campaign}`,
      ...['utm_source', 'utm_medium', 'utm_term', 'utm_content', 'referrer'].filter((key) => lead[key]).map((key) => `${title(key)}: ${lead[key]}`),
      lead.agency_partner_id && `Agency: ${byId(data.agencies, lead.agency_partner_id)?.legal_name}`,
    ].filter(Boolean)}/>
    {repeatEnquiries.length > 0 && <p className="my-4 rounded-xl bg-amber-50 p-3 text-sm">This contact has {repeatEnquiries.length} other enquiries for the same product.</p>}
    <p className="eyebrow mt-6">Pipeline stage, follow-up and agency</p>
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      <select aria-label="Pipeline stage" className="field" value={status} onChange={(e)=>setStatus(e.target.value)}>{WORKSPACE_LEAD_STATUSES.map((item)=><option key={item} value={item}>{title(item)}</option>)}</select>
      <input aria-label="Follow-up date" type="date" className="field" value={followUp} onChange={(e)=>setFollowUp(e.target.value)}/>
      <select aria-label="Referral agency" className="field" value={agencyId} onChange={(e)=>setAgencyId(e.target.value)}><option value="">Direct customer</option>{data.agencies.filter((item)=>item.status==='active' || item.id === lead.agency_partner_id).map((item)=><option key={item.id} value={item.id}>{item.trading_name||item.legal_name}</option>)}</select>
      <button onClick={saveStatus} className="gold-button justify-center">Save / assign to me</button>
    </div>
    <label className="mt-6 block">New interaction note<textarea className="field mt-2 min-h-28" value={note} onChange={(e)=>setNote(e.target.value)}/></label>
    <button onClick={addNote} className="gold-button mt-3">Add to history</button>
    <History title="Interaction history" rows={data.interactions.filter((item)=>item.lead_id===lead.id)
      .sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)).map((item)=>`${title(item.interaction_type)} · ${date(item.occurred_at)} · ${item.summary}`)}/>
  </Drawer>
}

function BookingPanel({ booking, data, close, reload }) {
  const [payment,setPayment]=useState({reference:'',amount:'',method:'bank_transfer',dueOn:'',confirmed:false}); const [refund,setRefund]=useState({reference:'',amount:'',reason:'',completed:false}); const [passenger,setPassenger]=useState(''); const finance=data.finances.find((item)=>item.booking_id===booking.id)
  const pay=async(e)=>{e.preventDefault();const {error}=await supabase.rpc('workspace_record_manual_payment',{p_booking_id:booking.id,p_reference:payment.reference,p_amount_minor:Math.round(Number(payment.amount)*100),p_method:payment.method,p_due_on:payment.dueOn||null,p_confirm_received:payment.confirmed,p_note:null});if(error)alert(error.message);else{setPayment({reference:'',amount:'',method:'bank_transfer',dueOn:'',confirmed:false});reload()}}
  const reimburse=async(e)=>{e.preventDefault();const {error}=await supabase.rpc('workspace_record_refund',{p_booking_id:booking.id,p_reference:refund.reference,p_amount_minor:Math.round(Number(refund.amount)*100),p_reason:refund.reason,p_payment_id:null,p_completed:refund.completed,p_note:null});if(error)alert(error.message);else{setRefund({reference:'',amount:'',reason:'',completed:false});reload()}}
  const cancel=async()=>{const reason=window.prompt('Cancellation reason');if(!reason)return;const {error}=await supabase.rpc('workspace_cancel_booking',{p_booking_id:booking.id,p_reason:reason});if(error)alert(error.message);else reload()}
  const confirmPayment=async(id)=>{const {error}=await supabase.rpc('workspace_confirm_manual_payment',{p_payment_id:id});if(error)alert(error.message);else reload()}
  const completeRefund=async(id)=>{const {error}=await supabase.rpc('workspace_complete_refund',{p_refund_id:id});if(error)alert(error.message);else reload()}
  const addPassenger=async()=>{if(!passenger.trim())return;const {error}=await supabase.from('workspace_booking_passengers').insert({booking_id:booking.id,display_name:passenger.trim(),passenger_type:'adult'});if(error)alert(error.message);else{setPassenger('');reload()}}
  const [notify, setNotify] = useState(false)
  const canNotify = data.contacts.some((contact) => contact.active && contact.kind === 'email' && contact.customer_id === booking.customer_id)
  const confirmBooking=async()=>{const {error}=await supabase.rpc('workspace_confirm_booking_and_notify',{p_booking_id:booking.id,p_notify:notify});if(error)alert(error.message);else reload()}
  const bookingPayments=data.payments.filter((item)=>item.booking_id===booking.id)
  const bookingRefunds=data.refunds.filter((item)=>item.booking_id===booking.id)
  const passengers=data.passengers.filter((item)=>item.booking_id===booking.id)
  return <Drawer title={booking.reference} subtitle={`${money(booking.agreed_price_minor,booking.currency)} · ${title(booking.status)}`} close={close}>
    <p className="mb-4 text-sm">{[byId(data.customers, booking.customer_id)?.display_name, byId(data.products, booking.product_id)?.name,
      byId(data.departures, booking.departure_id)?.code, byId(data.agencies, booking.agency_partner_id)?.legal_name].filter(Boolean).join(' · ')}</p>
    <div className="grid grid-cols-2 gap-3"><Metric label="Net received" value={money(finance?.net_received_minor,booking.currency)}/><Metric label="Outstanding" value={money(finance?.outstanding_minor,booking.currency)}/></div>
    <History title="Price history" rows={data.priceSnapshots.filter((item) => item.booking_id === booking.id).sort((a,b) => b.created_at.localeCompare(a.created_at))
      .map((item) => `${date(item.created_at)} · ${money(item.agreed_price_minor,item.currency)} · ${title(item.source)}`)}/>
    <h3 className="mt-7 font-semibold">Passengers ({passengers.length}/{booking.passenger_count})</h3>
    <div className="mt-3 space-y-2">{passengers.map((item)=><div key={item.id} className="rounded-xl bg-[#f7f5ef] p-3 text-sm">{item.display_name}{item.is_lead_passenger?' · Lead passenger':''}</div>)}</div>
    {['draft','provisional'].includes(booking.status) && <>
      {passengers.length<booking.passenger_count&&<div className="mt-3 flex gap-2"><input className="field" placeholder="Passenger name" value={passenger} onChange={(e)=>setPassenger(e.target.value)}/><button onClick={addPassenger} className="gold-button">Add</button></div>}
      {canNotify && <label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)}/>Queue confirmation email</label>}
      <button onClick={confirmBooking} disabled={!canConfirmBooking({status:booking.status,expectedPassengers:booking.passenger_count,actualPassengers:passengers.length})} className="gold-button mt-4">Confirm booking</button>
    </>}
    <h3 className="mt-7 font-semibold">Manual payment</h3>
    <form onSubmit={pay} className="mt-3 grid gap-3"><input required className="field" placeholder="Reference" value={payment.reference} onChange={(e)=>setPayment({...payment,reference:e.target.value})}/><input required min="0.01" step="0.01" type="number" className="field" placeholder="Amount AUD" value={payment.amount} onChange={(e)=>setPayment({...payment,amount:e.target.value})}/><input type="date" className="field" aria-label="Payment due date" value={payment.dueOn} onChange={(e)=>setPayment({...payment,dueOn:e.target.value})}/><select className="field" value={payment.method} onChange={(e)=>setPayment({...payment,method:e.target.value})}><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option><option value="other">Other</option></select><label className="flex gap-2 text-sm"><input type="checkbox" checked={payment.confirmed} onChange={(e)=>setPayment({...payment,confirmed:e.target.checked})}/>Confirm manually received (not processor verified)</label><button className="gold-button justify-center">Record payment</button></form>
    <div className="mt-3 space-y-2">{bookingPayments.map((item)=><div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f7f5ef] p-3 text-sm"><span>{item.reference} · {money(item.amount_minor,item.currency)} · {title(item.status)}{item.due_on && ` · Due ${date(item.due_on)}`}{item.received_at && ` · Received ${date(item.received_at)}`}</span>{item.status==='pending'&&<button onClick={()=>confirmPayment(item.id)} className="table-action">Confirm received</button>}</div>)}</div>
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
