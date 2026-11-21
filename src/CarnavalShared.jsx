import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

export function CarnavalNav({ dark = true }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className={`absolute inset-x-0 top-0 z-40 border-b ${dark ? 'border-white/10 text-white' : 'border-[#0a1730]/10 text-[#07152d]'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link to="/carnaval" className="group flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <img src="/images/logo-premium.png" alt="Curated Brazil Travel" className="h-11 w-11 shrink-0 rounded-xl border border-[#d7b866]/35 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.24)]" />
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-medium uppercase tracking-[0.32em] opacity-70">Curated Brazil</span>
            <span className="block text-xs font-semibold tracking-[0.08em] sm:text-sm sm:tracking-[0.12em]">Carnaval Collection 2027</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/carnaval" className="transition hover:text-[#e2c97f]">The collection</Link>
          <a href="#consultation" className="transition hover:text-[#e2c97f]">Private enquiry</a>
          <Link
            to="/"
            className="rounded-full border border-[#d7b866]/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-[#d7b866] hover:text-[#07152d]"
          >
            Signature Journey
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className="relative ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-current/20 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="relative h-4 w-5">
            <span className={`absolute left-0 top-0 h-px w-5 bg-current transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`absolute left-0 top-2 h-px w-5 bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 top-4 h-px w-5 bg-current transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-current/10 bg-[#07152d]/95 px-5 text-white backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2 py-4 text-sm">
              <Link to="/carnaval" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-white/10">The collection</Link>
              <a href="#consultation" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-white/10">Private enquiry</a>
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[#e2c97f] hover:bg-white/10">Signature Journey</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export function JourneyMeta({ item, light = false }) {
  const textClass = light ? 'text-white/78' : 'text-[#263756]'
  const borderClass = light ? 'border-white/15 bg-white/[0.07]' : 'border-[#0a1730]/10 bg-white'

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${textClass}`}>
      {[
        [CalendarDays, item.dates],
        [Clock3, item.duration],
        [MapPin, item.destinations.join(' · ')],
        [Users, `${item.maxTravelers} travellers maximum`],
      ].map(([Icon, value]) => (
        <div key={value} className={`flex min-w-0 items-start gap-3 rounded-2xl border px-4 py-4 text-sm leading-relaxed ${borderClass}`}>
          <Icon className="mt-0.5 shrink-0 text-[#d7b866]" size={17} />
          <span className="min-w-0 break-words">{value}</span>
        </div>
      ))}
    </div>
  )
}

export function ConsultationBlock({ compact = false }) {
  return (
    <section id="consultation" className={`${compact ? 'py-16' : 'py-20 md:py-24'} bg-[#07152d] px-5 text-white md:px-8`}>
      <motion.div {...reveal} className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#d7b866]/25 bg-[radial-gradient(circle_at_top_right,rgba(192,38,123,0.24),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.28)] md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#e2c97f]">Personalised quotation</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">Choose your Carnaval journey.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              Each experience has a dedicated enquiry form, with the journey automatically identified for the Curated Brazil Travel team.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm leading-7 text-white/68">
            <p className="font-semibold text-white">Your quotation options</p>
            <p className="mt-2">Select twin-share or single occupancy and choose whether you would like return international flights included.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 border-t border-white/10 pt-7 md:grid-cols-3">
          {[
            ['/carnaval/grand-journey', 'Grand Carnaval Journey'],
            ['/carnaval/rio-bahia', 'Rio & Bahia Escape'],
            ['/carnaval/rio-minas', 'Rio & Minas Heritage'],
          ].map(([path, label]) => (
            <Link key={path} to={path} className="rounded-full border border-[#d7b866]/40 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#e2c97f] transition hover:bg-[#d7b866] hover:text-[#07152d]">
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export function CarnavalFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#040916] px-5 py-10 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold tracking-[0.12em] text-white">Curated Brazil Travel</p>
          <p className="mt-2">Luxury journeys with cultural depth.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/carnaval" className="transition hover:text-[#e2c97f]">Carnaval Collection</Link>
          <Link to="/" className="transition hover:text-[#e2c97f]">Signature Journey</Link>
          <a href="mailto:hello@curatedbraziltravel.com" className="transition hover:text-[#e2c97f]">hello@curatedbraziltravel.com</a>
        </div>
        <p>© 2027 Curated Brazil Travel</p>
      </div>
    </footer>
  )
}

export function usePageTop() {
  useEffect(() => {
    if (window.location.hash) {
      const timer = window.setTimeout(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' })
      }, 250)
      return () => window.clearTimeout(timer)
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])
}
