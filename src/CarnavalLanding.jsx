import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Compass, Music2, Pause, Play, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { carnavalCommercial, carnavalDestinationOrder, carnavalImageMap, carnavalPackages } from './carnavalContent'
import { DestinationDiscovery } from './CarnavalDestinations'
import { CarnavalFooter, CarnavalNav, ConsultationBlock, reveal, usePageTop } from './CarnavalShared'
import { useI18n } from './i18n'

const faqs = [
  {
    question: 'Are the 2027 journeys available for commercial enquiries?',
    answer: 'Yes. Each journey is professionally designed and available for commercial enquiries. Once the group is confirmed, Curated Brazil Travel will coordinate the tickets, hospitality arrangements and travel services included in the selected itinerary, subject to market availability and the agreed booking conditions.',
  },
  {
    question: 'How is premium Carnaval hospitality arranged?',
    answer: carnavalCommercial.hospitalityNotice,
  },
  {
    question: 'What does the published from price include?',
    answer: 'The published from price is per person, twin share, and excludes international flights. All domestic flights in the itinerary remain included. Your final quotation will reflect availability, occupancy, departure city and selected options.',
  },
  {
    question: 'How can I request a quotation?',
    answer: 'Open your preferred journey and select Enquire About This Journey. The form identifies the package automatically and lets you choose accommodation and whether international flights should be included in your quotation.',
  },
]

const heroPath = (slug, size) => `/images/carnaval/${slug}--hero-${size}.webp`

const carnavalHeroSlides = [
  {
    id: 'principal',
    mobile: carnavalImageMap.collectionHero.mobile,
    tablet: carnavalImageMap.collectionHero.desktop,
    desktop: carnavalImageMap.collectionHero.desktop,
    alt: 'Samba school performers in the Rio de Janeiro Sambódromo',
    position: '62% center',
    principal: true,
  },
  {
    id: 'sambodromo',
    mobile: heroPath('sambodromo-hero', 'mobile'),
    tablet: heroPath('sambodromo-hero', 'tablet'),
    desktop: heroPath('sambodromo-hero', 'desktop'),
    alt: 'Panoramic night parade in a Brazilian Sambódromo',
    position: 'center',
  },
  {
    id: 'frevo',
    mobile: heroPath('frevo-hero', 'mobile'),
    tablet: heroPath('frevo-hero', 'tablet'),
    desktop: heroPath('frevo-hero', 'desktop'),
    alt: 'Frevo dancers with colourful umbrellas beside historic architecture',
    position: 'center',
  },
  {
    id: 'minas',
    mobile: heroPath('carnaval-minas-hero', 'mobile'),
    tablet: heroPath('carnaval-minas-hero', 'tablet'),
    desktop: heroPath('carnaval-minas-hero', 'desktop'),
    alt: 'Colourful street Carnaval celebration in Minas Gerais',
    position: 'center',
  },
  {
    id: 'hospitality',
    mobile: heroPath('camarote-premium-hero', 'mobile'),
    tablet: heroPath('camarote-premium-hero', 'tablet'),
    desktop: heroPath('camarote-premium-hero', 'desktop'),
    alt: 'Illustrative premium Carnaval hospitality scene with guests overlooking festivities',
    position: 'center',
  },
]

function CarnavalHeroCarousel() {
  const { t } = useI18n()
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [requested, setRequested] = useState(() => new Set([0, 1]))
  const total = carnavalHeroSlides.length

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    setRequested((existing) => new Set([...existing, current, (current + 1) % total]))
  }, [current, total])

  useEffect(() => {
    if (paused || reducedMotion) return undefined
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % total), 6000)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion, total])

  const select = (index) => setCurrent((index + total) % total)
  const previous = () => select(current - 1)
  const next = () => select(current + 1)

  return (
    <div
      className="absolute inset-0"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('carousel.region')}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') previous()
        if (event.key === 'ArrowRight') next()
        if (event.key === 'Home') select(0)
        if (event.key === 'End') select(total - 1)
      }}
    >
      <div className="absolute inset-0 bg-[var(--color-deep-forest-strong)]">
        {carnavalHeroSlides.map((slide, index) => requested.has(index) && (
          <picture
            key={slide.id}
            className={`carnaval-hero-slide ${current === index ? 'is-active' : ''}`}
            aria-hidden={current !== index}
          >
            <source media="(max-width: 767px)" srcSet={slide.mobile} />
            <source media="(max-width: 1279px)" srcSet={slide.tablet} />
            <img
              src={slide.desktop}
              alt={current === index ? slide.alt : ''}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              className={`carnaval-hero-slide__image ${slide.principal ? 'carnaval-hero-slide__image--principal' : ''}`}
              style={{ objectPosition: slide.position }}
            />
          </picture>
        ))}
      </div>
      <div className="carnaval-hero-overlay absolute inset-0" />

      {current > 0 && (
        <p className="absolute left-4 right-4 top-20 z-20 mx-auto max-w-[22rem] rounded-full bg-[var(--color-deep-forest)]/55 px-3 py-1 text-center text-[10px] leading-4 text-white/80 shadow-lg backdrop-blur-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] md:bottom-2 md:top-auto md:max-w-none md:bg-transparent md:px-0 md:py-0 md:text-xs md:leading-5 md:shadow-none md:backdrop-blur-none" role="note">
          {t('image.aiDisclosure')}
        </p>
      )}

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2.5 backdrop-blur-md md:bottom-8">
        <button type="button" className="carnaval-carousel-control" onClick={previous} aria-label={t('carousel.previous')}>
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2" role="group" aria-label={t('carousel.region')}>
          {carnavalHeroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => select(index)}
              className={`h-2 rounded-full transition-all duration-500 ${current === index ? 'w-7 bg-[var(--color-luxury-gold)]' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              aria-label={t('carousel.slide', { current: index + 1, total })}
              aria-current={current === index ? 'true' : undefined}
            />
          ))}
        </div>
        <button type="button" className="carnaval-carousel-control" onClick={next} aria-label={t('carousel.next')}>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="carnaval-carousel-control"
          onClick={() => setPaused((value) => !value)}
          aria-label={t(paused ? 'carousel.resume' : 'carousel.pause')}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

export default function CarnavalLanding() {
  usePageTop()
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[var(--color-warm-ivory)] text-[var(--color-deep-forest)]">
      <header className="relative min-h-[92vh] overflow-hidden bg-[var(--color-deep-forest-strong)] text-white">
        <CarnavalNav />
        <CarnavalHeroCarousel />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl items-center px-5 pb-14 pt-28 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="carnaval-hero-content w-full max-w-[52rem] [text-shadow:0_3px_22px_rgba(0,0,0,0.42)] md:ml-[3vw] lg:ml-[4vw]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-luxury-gold-soft)]">{t('carnaval.hero.eyebrow')}</p>
            <h1 className="mt-6 max-w-[50rem] text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance md:text-7xl lg:text-[5.5rem]">
              {t('carnaval.hero.title')}
            </h1>
            <p className="mt-6 max-w-[40rem] text-lg leading-8 text-white/80 md:text-[1.35rem] md:leading-9">
              {t('carnaval.hero.copy')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#journeys" className="rounded-full bg-[var(--color-luxury-gold)] px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-deep-forest)] transition hover:bg-[#ead491]">
                {t('carnaval.hero.explore')}
              </a>
              <a href="#journeys" className="rounded-full border border-white/35 bg-white/5 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em] backdrop-blur-md transition hover:bg-white hover:text-[var(--color-deep-forest)]">
                {t('carnaval.hero.compare')}
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      <main>
        <DestinationDiscovery destinationIds={carnavalDestinationOrder} />

        <section className="bg-[radial-gradient(circle_at_12%_20%,rgba(215,184,102,0.12),transparent_25%),radial-gradient(circle_at_92%_75%,rgba(192,38,123,0.10),transparent_28%)] px-5 py-16 md:px-8 md:py-20">
          <motion.div {...reveal} className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">{t('carnaval.perspective.eyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{t('carnaval.perspective.title')}</h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#435b55] lg:justify-self-end">
              Carnaval is not one experience. It changes across regions, rhythms and communities. This collection is designed to introduce those contrasts thoughtfully, pairing landmark moments with food, heritage, landscape and carefully paced transitions.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              [Music2, 'The Energy', 'Unforgettable Carnaval celebrations, from the pulse of the Sambódromo to the music-filled streets of Salvador.'],
              [ShieldCheck, 'The Exclusivity', 'Premium hospitality, intimate groups and thoughtful coordination designed around comfort and confidence.'],
              [Compass, 'The Culture', 'Authentic destinations, Brazilian gastronomy and living traditions interpreted with depth and local context.'],
            ].map(([Icon, title, copy], index) => (
              <motion.article
                key={title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-[var(--color-brazilian-green)]/10 bg-white p-7 shadow-[0_20px_65px_rgba(0,39,30,0.07)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-deep-forest)] text-[var(--color-luxury-gold-soft)]"><Icon size={20} /></span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-[#536a64]">{copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="journeys" className="bg-[var(--color-deep-forest)] px-5 py-16 text-white md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-luxury-gold-soft)]">{t('carnaval.journeys.eyebrow')}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">{t('carnaval.journeys.title')}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{t('carnaval.journeys.copy')}</p>
            </motion.div>

            <div className="mt-14 grid gap-7 lg:grid-cols-3">
              {carnavalPackages.map((item, index) => (
                <motion.article
                  key={item.id}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.08 }}
                  className="group flex flex-col overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.055] shadow-[0_28px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                >
                  <div className="relative h-56 overflow-hidden sm:h-60">
                    <img src={item.cardImage} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-deep-forest)] via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-[var(--color-deep-forest)]/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-md">{item.tier}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <p className="text-sm font-medium text-[var(--color-luxury-gold-soft)]">{item.dates}</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-4 flex-1 text-base leading-7 text-white/62">{item.summary}</p>
                    <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-white/70">
                      <p><span className="font-semibold text-white">{t('common.duration')}</span> {item.duration}</p>
                      <p><span className="font-semibold text-white">{t('common.group')}</span> {t('common.maximum', { count: item.maxTravelers })}</p>
                      <p className="leading-6"><span className="font-semibold text-white">{t('common.cities')}</span> {item.destinations.join(' · ')}</p>
                    </div>
                    <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5">
                      <span className="font-semibold leading-6 text-white">{item.price}</span>
                      <Link to={item.path} className="rounded-full border border-[var(--color-luxury-gold)]/45 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-luxury-gold-soft)] transition hover:bg-[var(--color-luxury-gold)] hover:text-[var(--color-deep-forest)]">
                        {t('common.viewExperience')}
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            <p className="mt-8 max-w-4xl text-sm italic leading-6 text-white/50">{carnavalCommercial.priceNote}</p>
          </div>
        </section>

        <section className="px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="grid gap-10 overflow-hidden rounded-[2.25rem] bg-white p-7 shadow-[0_30px_90px_rgba(0,39,30,0.09)] md:grid-cols-[0.9fr_1.1fr] md:p-12">
              <div className="relative min-h-80 overflow-hidden rounded-[1.5rem]">
                <img src="/images/salvador1.webp" alt="Cultural experience in Salvador" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-deep-forest)]/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm uppercase tracking-[0.22em] text-[#f1d991]">One country, many expressions</p>
                  <p className="mt-2 text-xl font-semibold">Designed around place, people and pace.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Collection notes</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">Your Carnaval Experience, Thoughtfully Curated.</h2>
                <p className="mt-5 leading-7 text-[#4b655f]">Every journey is carefully designed to deliver an authentic and memorable Brazilian Carnaval experience, combining premium comfort, cultural immersion and personalised coordination.</p>
                <div className="mt-7 space-y-5 text-[#4b655f]">
                  {[
                    ['Travel window', 'Late January to mid-February 2027, depending on the selected journey.'],
                    ['Journey style', 'Boutique groups, premium accommodation, coordinated transport and culturally immersive experiences.'],
                    ['Coordination', 'Once the group is confirmed, tickets, hospitality arrangements and travel services will be coordinated according to the selected itinerary and market availability.'],
                    ['Your protection', 'Any material substitution will be disclosed and agreed before booking confirmation, or handled under the applicable booking terms and consumer rights.'],
                  ].map(([label, copy]) => (
                    <div key={label} className="grid gap-1 border-b border-[var(--color-brazilian-green)]/10 pb-5 sm:grid-cols-[9rem_1fr]">
                      <p className="font-semibold text-[var(--color-deep-forest)]">{label}</p>
                      <p className="leading-7">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-[#efeaf0] px-5 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div {...reveal} className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Planning notes</p>
              <h2 className="mt-4 text-4xl font-semibold md:text-5xl">Frequently asked questions</h2>
            </motion.div>
            <div className="mt-12 space-y-4">
              {faqs.map((item, index) => (
                <motion.details
                  key={item.question}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: index * 0.05 }}
                  className="group rounded-2xl border border-[var(--color-brazilian-green)]/10 bg-white p-6 open:shadow-[0_18px_55px_rgba(0,39,30,0.07)]"
                >
                  <summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">{item.question}</summary>
                  <p className="mt-4 max-w-3xl leading-7 text-[#536a64]">{item.answer}</p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        <ConsultationBlock />
      </main>

      <CarnavalFooter />
    </div>
  )
}
