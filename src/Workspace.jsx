import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCheck, FaSignOutAlt, FaSearch, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { supabase } from './lib/supabase'

const statusOptions = ['New', 'Contacted', 'Proposal Sent', 'Booked', 'Lost']

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const getCreatedDate = (item) => item.created_at || item.submission_timestamp || item.inserted_at
const getStatus = (item) => item.status || 'New'
const normalize = (value) => String(value || '').toLowerCase()

const applyListControls = (items, search, statusFilter, sortOrder, includeStatus = true) =>
  [...items]
    .filter((item) => {
      const term = normalize(search)
      const matchesSearch =
        !term ||
        normalize(item.full_name || item.first_name).includes(term) ||
        normalize(item.email).includes(term)
      const matchesStatus = !includeStatus || statusFilter === 'All' || getStatus(item) === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aTime = new Date(getCreatedDate(a) || 0).getTime()
      const bTime = new Date(getCreatedDate(b) || 0).getTime()

      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime
    })

export default function Workspace() {
  const [authReady, setAuthReady] = useState(false)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [authorizing, setAuthorizing] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [applications, setApplications] = useState([])
  const [leads, setLeads] = useState([])
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedLead, setSelectedLead] = useState(null)
  const [selectedLeadType, setSelectedLeadType] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setAuthReady(true)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setProfile(null)
      setAccessDenied(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!session?.user?.id) return

      setAuthorizing(true)
      console.group('Workspace authorization')
      console.log('authenticated user object:', session.user)
      console.log('user.id:', session.user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .maybeSingle()

      const isAdmin = !error && data?.role === 'admin'

      console.log('profile record returned from public.profiles:', data)
      console.log('profile query error:', error)
      console.log('role value:', data?.role)
      console.log('authorization decision:', isAdmin ? 'granted' : 'denied')
      console.groupEnd()

      if (!isAdmin) {
        setAccessDenied(true)
        setProfile(null)
      } else {
        setAccessDenied(false)
        setProfile(data)
      }

      setAuthorizing(false)
    }

    verifyAdmin()
  }, [session])

  useEffect(() => {
    if (!profile) return

    loadWorkspaceData()
  }, [profile])

  const loadWorkspaceData = async () => {
    setDataLoading(true)

    const [applicationsResult, leadsResult] = await Promise.all([
      supabase.from('luxury_applications').select('*').order('created_at', { ascending: false }),
      supabase
        .from('leads')
        .select('*')
        .eq('source', 'whatsapp_consultation')
        .order('created_at', { ascending: false }),
    ])

    if (applicationsResult.error) {
      console.error('Luxury applications could not be loaded:', applicationsResult.error)
    } else {
      setApplications(applicationsResult.data || [])
    }

    if (leadsResult.error) {
      console.error('WhatsApp leads could not be loaded:', leadsResult.error)
    } else {
      setLeads(leadsResult.data || [])
    }

    setDataLoading(false)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    })

    if (error) {
      setLoginError(error.message)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setApplications([])
    setLeads([])
    setActiveView('dashboard')
  }

  const updateApplication = async (id, patch) => {
    setSavingId(id)

    const { data, error } = await supabase
      .from('luxury_applications')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Luxury application could not be updated:', error)
    } else {
      setApplications((current) => current.map((item) => (item.id === id ? data : item)))
      setSelectedLead((current) => (current?.id === id ? data : current))
    }

    setSavingId('')
  }

  const updateLeadNotes = async (id, notes) => {
    setSavingId(id)

    const { data, error } = await supabase.from('leads').update({ notes }).eq('id', id).select('*').single()

    if (error) {
      console.error('WhatsApp lead notes could not be updated:', error)
    } else {
      setLeads((current) => current.map((item) => (item.id === id ? data : item)))
      setSelectedLead((current) => (current?.id === id ? data : current))
    }

    setSavingId('')
  }

  const allPipelineItems = useMemo(() => [...applications, ...leads], [applications, leads])
  const kpis = useMemo(
    () => ({
      applications: applications.length,
      whatsapp: leads.length,
      new: allPipelineItems.filter((item) => getStatus(item) === 'New').length,
      contacted: allPipelineItems.filter((item) => getStatus(item) === 'Contacted').length,
      proposal: allPipelineItems.filter((item) => getStatus(item) === 'Proposal Sent').length,
      booked: allPipelineItems.filter((item) => getStatus(item) === 'Booked').length,
    }),
    [applications, leads, allPipelineItems],
  )

  const filteredApplications = useMemo(
    () => applyListControls(applications, search, statusFilter, sortOrder),
    [applications, search, statusFilter, sortOrder],
  )

  const filteredLeads = useMemo(
    () => applyListControls(leads, search, 'All', sortOrder, false),
    [leads, search, sortOrder],
  )

  const openLeadDetails = (lead, type) => {
    setSelectedLead(lead)
    setSelectedLeadType(type)
  }

  if (!authReady) {
    return (
      <WorkspaceShell>
        <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.24em] text-[#9c7a3c]">
          Preparing private workspace...
        </div>
      </WorkspaceShell>
    )
  }

  if (!session) {
    return (
      <WorkspaceShell>
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d4af37]/25 bg-white shadow-[0_28px_80px_rgba(24,24,27,0.12)]"
          >
            <div className="bg-[#11100d] px-8 py-9 text-white">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f1d991]">Curated Brazil</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">Management Portal</h1>
              <p className="mt-4 text-sm leading-7 text-white/72">Private access for authorized travel specialists.</p>
            </div>

            <div className="space-y-5 p-8">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Email</span>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Password</span>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                />
              </label>

              {loginError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#d4af37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-black shadow-[0_18px_45px_rgba(212,175,55,0.24)] outline-none transition hover:bg-[#f0d57e] focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? 'Verifying...' : 'Enter Workspace'}
              </button>

              <Link to="/" className="block text-center text-xs uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[#9c7a3c]">
                Return to website
              </Link>
            </div>
          </form>
        </div>
      </WorkspaceShell>
    )
  }

  if (authorizing || (session && !profile && !accessDenied)) {
    return (
      <WorkspaceShell>
        <div className="flex min-h-screen items-center justify-center text-sm uppercase tracking-[0.24em] text-[#9c7a3c]">
          Verifying private access...
        </div>
      </WorkspaceShell>
    )
  }

  if (accessDenied) {
    return (
      <WorkspaceShell>
        <div className="flex min-h-screen items-center justify-center px-6 py-12 text-center">
          <div className="max-w-md rounded-[2rem] border border-[#d4af37]/25 bg-white p-9 shadow-[0_28px_80px_rgba(24,24,27,0.10)]">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9c7a3c]">Private Workspace</p>
            <h1 className="mt-4 text-3xl font-semibold">Access Denied</h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600">Your account is authenticated but is not authorized for this management portal.</p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-7 rounded-full bg-[#11100d] px-7 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
            >
              Logout
            </button>
          </div>
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell>
      <div className="min-h-screen">
        <header className="border-b border-[#d4af37]/20 bg-[#11100d] px-6 py-6 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f1d991]">Curated Brazil</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">Management Portal</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="rounded-full border border-white/15 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white/80 transition hover:border-[#d4af37] hover:text-white"
              >
                Public Site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#f0d57e]"
              >
                <FaSignOutAlt size={13} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-7 flex flex-wrap gap-3">
            {[
              ['dashboard', 'Dashboard'],
              ['applications', 'Luxury Applications'],
              ['whatsapp', 'WhatsApp Leads'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`rounded-full px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] transition ${
                  activeView === id
                    ? 'bg-[#11100d] text-white shadow-[0_14px_35px_rgba(24,24,27,0.16)]'
                    : 'border border-[#d4af37]/25 bg-white text-zinc-600 hover:border-[#d4af37] hover:text-zinc-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {dataLoading && <p className="mb-5 text-sm uppercase tracking-[0.18em] text-[#9c7a3c]">Loading workspace data...</p>}

          {activeView === 'dashboard' && <Dashboard kpis={kpis} applications={applications} leads={leads} openLeadDetails={openLeadDetails} />}

          {activeView !== 'dashboard' && (
            <Filters
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              showStatus={activeView === 'applications'}
            />
          )}

          {activeView === 'applications' && (
            <ApplicationsTable
              applications={filteredApplications}
              openLeadDetails={openLeadDetails}
              updateApplication={updateApplication}
              savingId={savingId}
            />
          )}

          {activeView === 'whatsapp' && <WhatsAppTable leads={filteredLeads} openLeadDetails={openLeadDetails} />}
        </main>

        {selectedLead && (
          <LeadDetails
            lead={selectedLead}
            type={selectedLeadType}
            onClose={() => setSelectedLead(null)}
            onSaveNotes={selectedLeadType === 'application' ? updateApplication : updateLeadNotes}
            saving={savingId === selectedLead.id}
          />
        )}
      </div>
    </WorkspaceShell>
  )
}

function WorkspaceShell({ children }) {
  return <div className="min-h-screen bg-[#fbfaf7] text-zinc-900 antialiased selection:bg-[#d4af37]/25">{children}</div>
}

function Dashboard({ kpis, applications, leads, openLeadDetails }) {
  const cards = [
    ['Total Luxury Applications', kpis.applications],
    ['Total WhatsApp Leads', kpis.whatsapp],
    ['New Leads', kpis.new],
    ['Contacted Leads', kpis.contacted],
    ['Proposal Sent', kpis.proposal],
    ['Booked Leads', kpis.booked],
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] border border-[#d4af37]/20 bg-white p-6 shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9c7a3c]">{label}</p>
            <p className="mt-4 text-4xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPanel title="Recent Luxury Applications" items={applications.slice(0, 5)} type="application" openLeadDetails={openLeadDetails} />
        <RecentPanel title="Recent WhatsApp Leads" items={leads.slice(0, 5)} type="whatsapp" openLeadDetails={openLeadDetails} />
      </div>
    </div>
  )
}

function RecentPanel({ title, items, type, openLeadDetails }) {
  return (
    <div className="rounded-[1.5rem] border border-[#d4af37]/20 bg-white p-6 shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="text-sm text-zinc-500">No records yet.</p>}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLeadDetails(item, type)}
            className="flex w-full items-center justify-between rounded-2xl border border-zinc-100 bg-[#fbfaf7] px-4 py-3 text-left transition hover:border-[#d4af37]/45"
          >
            <span>
              <span className="block font-medium">{item.full_name || item.first_name || '-'}</span>
              <span className="text-sm text-zinc-500">{item.email || '-'}</span>
            </span>
            <span className="text-xs uppercase tracking-[0.16em] text-[#9c7a3c]">{formatDate(getCreatedDate(item))}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Filters({ search, setSearch, statusFilter, setStatusFilter, sortOrder, setSortOrder, showStatus }) {
  return (
    <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-[#d4af37]/20 bg-white p-4 shadow-[0_18px_55px_rgba(24,24,27,0.06)] md:grid-cols-[1fr_auto_auto]">
      <label className="relative block">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-full border border-zinc-200 bg-[#fbfaf7] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
        />
      </label>

      {showStatus && (
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-full border border-zinc-200 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      )}

      <select
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
        className="rounded-full border border-zinc-200 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  )
}

function ApplicationsTable({ applications, openLeadDetails, updateApplication, savingId }) {
  return (
    <TableShell empty={!applications.length}>
      <thead className="bg-[#11100d] text-left text-xs uppercase tracking-[0.16em] text-[#f1d991]">
        <tr>
          {['Full Name', 'Email', 'WhatsApp', 'Country', 'Journey Date', 'Budget', 'Preferred Journey', 'Status', 'Created', ''].map((head) => (
            <th key={head} className="px-4 py-4 font-medium">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 text-sm">
        {applications.map((item) => (
          <tr key={item.id} className="align-top">
            <td className="px-4 py-4 font-medium">{item.full_name || '-'}</td>
            <td className="px-4 py-4">{item.email || '-'}</td>
            <td className="px-4 py-4">{item.whatsapp || '-'}</td>
            <td className="px-4 py-4">{item.country || item.country_of_residence || '-'}</td>
            <td className="px-4 py-4">{item.journey_date || '-'}</td>
            <td className="px-4 py-4">{item.budget_range || '-'}</td>
            <td className="px-4 py-4">{item.preferred_journey || '-'}</td>
            <td className="px-4 py-4">
              <select
                value={getStatus(item)}
                onChange={(event) => updateApplication(item.id, { status: event.target.value })}
                disabled={savingId === item.id}
                className="rounded-full border border-[#d4af37]/25 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#d4af37]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </td>
            <td className="px-4 py-4">{formatDate(getCreatedDate(item))}</td>
            <td className="px-4 py-4">
              <button type="button" onClick={() => openLeadDetails(item, 'application')} className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c7a3c]">
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function WhatsAppTable({ leads, openLeadDetails }) {
  return (
    <TableShell empty={!leads.length}>
      <thead className="bg-[#11100d] text-left text-xs uppercase tracking-[0.16em] text-[#f1d991]">
        <tr>
          {['Full Name', 'Email', 'Country', 'City', 'Referral Source', 'Created', ''].map((head) => (
            <th key={head} className="px-4 py-4 font-medium">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 text-sm">
        {leads.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-4 font-medium">{item.full_name || item.first_name || '-'}</td>
            <td className="px-4 py-4">{item.email || '-'}</td>
            <td className="px-4 py-4">{item.country_of_residence || item.country || '-'}</td>
            <td className="px-4 py-4">{item.city || '-'}</td>
            <td className="px-4 py-4">{item.referral_source || '-'}</td>
            <td className="px-4 py-4">{formatDate(getCreatedDate(item))}</td>
            <td className="px-4 py-4">
              <button type="button" onClick={() => openLeadDetails(item, 'whatsapp')} className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9c7a3c]">
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function TableShell({ children, empty }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#d4af37]/20 bg-white shadow-[0_20px_60px_rgba(24,24,27,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">{children}</table>
      </div>
      {empty && <p className="p-6 text-sm text-zinc-500">No records match the current filters.</p>}
    </div>
  )
}

function LeadDetails({ lead, type, onClose, onSaveNotes, saving }) {
  const [notes, setNotes] = useState(lead.notes || '')

  useEffect(() => {
    setNotes(lead.notes || '')
  }, [lead])

  const detailRows = Object.entries(lead).filter(([, value]) => value !== null && value !== undefined && value !== '')

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#d4af37]/25 bg-[#fbfaf7] shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
        <div className="bg-[#11100d] px-6 py-7 text-white md:px-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f1d991]">{type === 'application' ? 'Luxury Application' : 'WhatsApp Lead'}</p>
              <h2 className="mt-3 text-3xl font-semibold">{lead.full_name || lead.first_name || '-'}</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/72">
                {lead.email && <span className="inline-flex items-center gap-2"><FaEnvelope size={13} />{lead.email}</span>}
                {lead.whatsapp && <span className="inline-flex items-center gap-2"><FaWhatsapp size={13} />{lead.whatsapp}</span>}
              </div>
            </div>
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-[#d4af37] hover:text-white">
              x
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:p-8">
          {type === 'application' && (
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <label>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Status</span>
                <select
                  value={getStatus(lead)}
                  onChange={(event) => onSaveNotes(lead.id, { status: event.target.value, notes })}
                  disabled={saving}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-3 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Internal Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows="5"
              className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
            />
          </label>

          <button
            type="button"
            onClick={() => onSaveNotes(lead.id, type === 'application' ? { notes } : notes)}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d4af37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#f0d57e] disabled:cursor-wait disabled:opacity-70 md:w-auto"
          >
            <FaCheck size={13} />
            {saving ? 'Saving...' : 'Save Notes'}
          </button>

          <div className="rounded-[1.5rem] border border-[#d4af37]/20 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9c7a3c]">All Information</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {detailRows.map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-[#fbfaf7] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">{key.replace(/_/g, ' ')}</p>
                  <p className="mt-2 break-words text-sm leading-6 text-zinc-700">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
