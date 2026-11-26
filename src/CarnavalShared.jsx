import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LanguageSelector } from './LanguageSelector'
import { useI18n } from './i18n'

export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

export function CarnavalNav({ dark = true }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useI18n()

  return (
    <nav className={`carnaval-nav absolute inset-x-0 top-0 z-40 border-b ${dark ? 'carnaval-nav--dark border-white/10 text-white' : 'border-[var(--color-brazilian-green)]/10 text-[var(--color-deep-forest)]'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-5 py-5 md:px-8">
        <Link to="/carnaval" className="group flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <img src="/images/logo-premium.png" alt="Curated Brazil Travel" className="h-11 w-11 shrink-0 rounded-xl border border-[var(--color-luxury-gold)]/35 object-cover shadow-[0_8px_24px_rgba(0,0,0,0.24)]" />
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-medium uppercase tracking-[0.32em] opacity-70">Curated Brazil</span>
            <span className="block text-xs font-semibold tracking-[0.08em] sm:text-sm sm:tracking-[0.12em]">Carnaval Collection 2027</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/carnaval" className="transition hover:text-[var(--color-luxury-gold-soft)]">{t('nav.collection')}</Link>
          <a href="#consultation" className="transition hover:text-[var(--color-luxury-gold-soft)]">{t('nav.enquiry')}</a>
          <Link
            to="/"
            className="rounded-full border border-[var(--color-luxury-gold)]/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-[var(--color-luxury-gold)] hover:text-[var(--color-deep-forest)]"
          >
            {t('nav.signature')}
          </Link>
          <LanguageSelector />
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <LanguageSelector compact />
          <button
            type="button"
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-current/20"
          >
            <span className="sr-only">Menu</span>
            <span className="relative h-4 w-5">
              <span className={`absolute left-0 top-0 h-px w-5 bg-current transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`absolute left-0 top-2 h-px w-5 bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 top-4 h-px w-5 bg-current transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-current/10 bg-[var(--color-deep-forest)]/95 px-5 text-white backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2 py-4 text-sm">
              <Link to="/carnaval" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-white/10">{t('nav.collection')}</Link>
              <a href="#consultation" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 hover:bg-white/10">{t('nav.enquiry')}</a>
              <Link to="/" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[var(--color-luxury-gold-soft)] hover:bg-white/10">{t('nav.signature')}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export function JourneyMeta({ item, light = false }) {
  const textClass = light ? 'text-white/78' : 'text-[#254b42]'
  const borderClass = light ? 'border-white/15 bg-white/[0.07]' : 'border-[var(--color-brazilian-green)]/10 bg-white'

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${textClass}`}>
      {[
        [CalendarDays, item.dates],
        [Clock3, item.duration],
        [MapPin, item.destinations.join(' · ')],
        [Users, `${item.maxTravelers} travellers maximum`],
      ].map(([Icon, value]) => (
        <div key={value} className={`flex min-w-0 items-start gap-3 rounded-2xl border px-4 py-4 text-sm leading-relaxed ${borderClass}`}>
          <Icon className="mt-0.5 shrink-0 text-[var(--color-luxury-gold)]" size={17} />
          <span className="min-w-0 break-words">{value}</span>
        </div>
      ))}
    </div>
  )
}

export function ConsultationBlock({ compact = false }) {
  const { t } = useI18n()
  return (
    <section id="consultation" className={`${compact ? 'py-16' : 'py-20 md:py-24'} bg-[var(--color-deep-forest)] px-5 text-white md:px-8`}>
      <motion.div {...reveal} className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--color-luxury-gold)]/25 bg-[radial-gradient(circle_at_top_right,rgba(192,38,123,0.24),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.28)] md:p-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-luxury-gold-soft)]">{t('carnaval.consultation.eyebrow')}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">{t('carnaval.consultation.title')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
              {t('carnaval.consultation.copy')}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm leading-7 text-white/68">
            <p className="font-semibold text-white">{t('carnaval.consultation.options')}</p>
            <p className="mt-2">{t('carnaval.consultation.optionsCopy')}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 border-t border-white/10 pt-7 md:grid-cols-3">
          {[
            ['/carnaval/grand-journey', 'Grand Carnaval Journey'],
            ['/carnaval/rio-bahia', 'Rio & Bahia Escape'],
            ['/carnaval/rio-minas', 'Rio & Minas Heritage'],
          ].map(([path, label]) => (
            <Link key={path} to={path} className="rounded-full border border-[var(--color-luxury-gold)]/40 px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-luxury-gold-soft)] transition hover:bg-[var(--color-luxury-gold)] hover:text-[var(--color-deep-forest)]">
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export function CarnavalFooter() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-white/10 bg-[var(--color-deep-forest-strong)] px-5 py-10 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold tracking-[0.12em] text-white">Curated Brazil Travel</p>
          <p className="mt-2">{t('carnaval.footer.tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/carnaval" className="transition hover:text-[var(--color-luxury-gold-soft)]">Carnaval Collection</Link>
          <Link to="/" className="transition hover:text-[var(--color-luxury-gold-soft)]">Signature Journey</Link>
          <a href="mailto:hello@curatedbraziltravel.com" className="transition hover:text-[var(--color-luxury-gold-soft)]">hello@curatedbraziltravel.com</a>
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
