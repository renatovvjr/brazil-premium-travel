import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaInstagram, FaWhatsapp, FaEnvelope, FaCheck } from 'react-icons/fa'
import { supabase } from './lib/supabase'
import { Link } from 'react-router-dom'

const getInitialApplicationForm = () => ({
  fullName: '',
  email: '',
  whatsapp: '',
  travelers: 'Solo Traveler',
  visitedBrazil: 'No',
  visitedPlaces: '',
  interests: [],
  budget: 'AUD 20k\u201330k',
  dreamExperience: '',
})

const getInitialWhatsAppLeadForm = () => ({
  fullName: '',
  email: '',
  countryOfResidence: '',
  city: '',
  birthDate: '',
  referralSource: '',
})

export default function App() {
  const [loading, setLoading] = useState(false)
  const [whatsAppLeadLoading, setWhatsAppLeadLoading] = useState(false)
  const [whatsAppLeadModalOpen, setWhatsAppLeadModalOpen] = useState(false)
  const [whatsAppLeadForm, setWhatsAppLeadForm] = useState(getInitialWhatsAppLeadForm)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openExperience, setOpenExperience] = useState('signature')
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [applicationForm, setApplicationForm] = useState(getInitialApplicationForm)
  const heroImages = [
    '/images/rio_de_janeiro_carrossel.png',
    '/images/rio_de_janeiro_carrossel0.png',
    '/images/rio_de_janeiro_carrossel1.png',
    '/images/rio_de_janeiro_carrossel2.png',
    '/images/rio_de_janeiro_carrossel3.png',
    '/images/rio_de_janeiro_carrossel4.png',
    '/images/rio_de_janeiro_carrossel5.png',
    '/images/rio_de_janeiro_carrossel6.png',
  ]

  const [currentHero, setCurrentHero] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const destinations = [
    { title: 'São Paulo', text: 'Luxury arrival and green spaces.', image: '/images/sao_paulo.webp' },
    { title: 'Amazon', text: 'Rainforest immersion.', image: '/images/amazonia.webp' },
    { title: 'Pantanal', text: 'Wildlife safari.', image: '/images/pantanal.webp' },
    { title: 'Bonito', text: 'Crystal-clear rivers.', image: '/images/bonito.webp' },
    { title: 'Salvador', text: 'Culture and heritage.', image: '/images/salvador.webp' },
    { title: 'Minas Gerais', text: 'Colonial charm.', image: '/images/minas_gerais.webp' },
    { title: 'Rio de Janeiro', text: 'Iconic landscapes.', image: '/images/rio_de_janeiro.webp' },
    { title: 'Ilha Grande', text: 'Turquoise waters.', image: '/images/ilha_grande.webp' },
    { title: 'Iguazu Falls', text: 'Spectacular finale.', image: '/images/cataratas_do_iguacu.webp' },
  ]

  const pricingExperiences = [
    {
      id: 'signature',
      tag: 'Most Popular',
      title: 'Curated Brazil Signature',
      price: 'AUD 29,900',
      description:
        'A fully curated luxury journey across Brazil designed for travellers seeking comfort, authenticity and unforgettable experiences.',
      included: [
        'Premium hotels',
        'All domestic flights within Brazil',
        'Private airport transfers',
        'Curated local experiences',
        'Selected fine dining experiences',
        'Private guides',
        'English-speaking interpreter support',
        'Professional travel assistance',
        'Selected photography coverage',
        'Small premium group experience',
      ],
      whatsappMessage:
        "Hi Renato, I'm interested in the Curated Brazil Signature experience (AUD 29,900) and would like to learn more about joining the waitlist.",
    },
    {
      id: 'all-inclusive',
      tag: 'Ultimate Comfort',
      title: 'Curated Brazil All-Inclusive',
      price: 'AUD 35,900',
      description:
        'An effortless luxury experience including international flights, premium comfort travel and complete concierge-style coordination.',
      highlight: 'You simply arrive. We handle everything.',
      included: [
        'International flights Australia ↔ Brazil',
        'Premium comfort seating',
        '2 checked bags',
        'VIP airport lounge access',
        'Premium hotels',
        'All domestic flights within Brazil',
        'Private airport transfers',
        'Curated local experiences',
        'Selected fine dining experiences',
        'Private guides',
        'English-speaking interpreter support',
        'Professional travel assistance',
        'Selected photography coverage',
        'Small premium group experience',
      ],
      whatsappMessage:
        "Hi Renato, I'm interested in the Curated Brazil All-Inclusive experience (AUD 35,900) and would like to learn more about joining the waitlist.",
    },
  ]

  const travelerOptions = ['Solo Traveler', 'Couple', 'Family', 'Private Group']
  const inauguralJourney = 'September 2026 \u2014 Inaugural Journey'
  const visitedBrazilOptions = ['Yes', 'No']
  const experienceOptions = [
    'Luxury Nature',
    'Beaches & Resorts',
    'Amazon Experience',
    'Culture & History',
    'Gastronomy',
    'Wellness & Relaxation',
    'Adventure',
    'Fully Curated Journey',
  ]
  const budgetOptions = ['AUD 20k\u201330k', 'AUD 30k\u201340k', 'AUD 40k+']
  const referralOptions = [
    'Instagram',
    'Facebook',
    'Google Search',
    'Friend Recommendation',
    'Travel Agent',
    'Other',
  ]
  const whatsAppWelcomeMessage = `Welcome to Curated Brazil! 🇧🇷✨

Thank you for reaching out.

We are delighted by your interest in discovering Brazil through carefully curated and unforgettable experiences.

This WhatsApp channel is dedicated to providing personalized assistance. Whether you have questions about our journeys, destinations, accommodations, activities, or would simply like to discuss your travel plans, our team will be happy to assist you personally.

If you are interested in joining our exclusive Brazil Signature Journey, we invite you to complete our application form at:

🌎 www.curatedbraziltravel.com

Once submitted, we will carefully review your preferences and contact you with more details about the experience.

We look forward to helping you create a truly remarkable journey through Brazil.

Warm regards,

Curated Brazil
Luxury Travel Experiences`

  const handleApplicationChange = (event) => {
    const { name, value } = event.target

    setApplicationForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleInterestToggle = (interest) => {
    setApplicationForm((current) => {
      const selected = current.interests.includes(interest)

      return {
        ...current,
        interests: selected
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      }
    })
  }

  const handleApplicationReset = () => {
    setApplicationForm(getInitialApplicationForm())
    setApplicationSuccess(false)
  }

  const handleWhatsAppLeadChange = (event) => {
    const { name, value } = event.target

    setWhatsAppLeadForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const openWhatsAppLeadModal = () => {
    setMobileMenuOpen(false)
    setWhatsAppLeadModalOpen(true)
  }

  const closeWhatsAppLeadModal = () => {
    if (!whatsAppLeadLoading) {
      setWhatsAppLeadModalOpen(false)
    }
  }

  const handleWhatsAppLeadSubmit = async (event) => {
    event.preventDefault()

    const {
      fullName,
      email,
      countryOfResidence,
      city,
      birthDate,
      referralSource,
    } = whatsAppLeadForm

    if (!fullName || !email || !countryOfResidence) {
      alert('Please fill in your details')
      return
    }

    setWhatsAppLeadLoading(true)

    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            full_name: fullName,
            email,
            country_of_residence: countryOfResidence,
            city: city || null,
            birth_date: birthDate || null,
            referral_source: referralSource || null,
            source: 'whatsapp_consultation',
            created_at: new Date().toISOString(),
          },
        ])

      if (error) {
        console.error('WhatsApp consultation lead could not be saved:', error)
      }
    } catch (error) {
      console.error('WhatsApp consultation lead could not be saved:', error)
    }

    window.open(`https://wa.me/61470289562?text=${encodeURIComponent(whatsAppWelcomeMessage)}`, '_blank', 'noreferrer')
    setWhatsAppLeadLoading(false)
    setWhatsAppLeadModalOpen(false)
    setWhatsAppLeadForm(getInitialWhatsAppLeadForm())
  }

  const handleWhatsAppForm = async (event) => {
    event.preventDefault()

    const {
      fullName,
      email,
      whatsapp,
      travelers,
      visitedBrazil,
      visitedPlaces,
      interests,
      budget,
      dreamExperience,
    } = applicationForm

    if (!fullName || !email || !whatsapp) {
      alert('Please fill in your details')
      return
    }

    setLoading(true)
    setApplicationSuccess(false)

    const interestsText = interests.length ? interests.join(', ') : 'To be discussed'
    const submissionTimestamp = new Date().toISOString()
    const leadPayload = {
      full_name: fullName,
      email,
      whatsapp,
      travelers,
      preferred_journey: inauguralJourney,
      journey_date: 'September 4th, 2026',
      visited_brazil: visitedBrazil,
      visited_places: visitedBrazil === 'Yes' ? visitedPlaces : '',
      experience_interests: interests,
      budget_range: budget,
      dream_experience: dreamExperience,
      submission_timestamp: submissionTimestamp,
      source: 'private_journey_application',
    }

    try {
      const { error } = await supabase
        .from('luxury_applications')
        .insert([
          {
            full_name: fullName,
            email,
            whatsapp,
            travelers,
            preferred_journey: inauguralJourney,
            journey_date: 'September 4th, 2026',
            visited_brazil: visitedBrazil,
            visited_places: visitedBrazil === 'Yes' ? visitedPlaces : '',
            experience_interests: interests,
            budget_range: budget,
            dream_experience: dreamExperience,
            submission_timestamp: submissionTimestamp,
            source: 'private_journey_application',
            created_at: submissionTimestamp,
          },
        ])

      if (error) {
        console.error('Luxury application could not be saved:', error)
      }
    } catch (error) {
      console.error('Luxury application could not be saved:', error)
    }

    const text = `Hello Curated Brazil,

My name is ${fullName}.
I'm interested in a curated luxury journey through Brazil.

Preferred journey: ${inauguralJourney}
Travelers: ${travelers}
Experience interests: ${interestsText}

I would love to receive more information about the experience.`

    fetch('/api/send-application-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(leadPayload),
    }).catch((error) => {
      console.error('Application email notification could not be sent:', error)
    })

    setApplicationSuccess(true)
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-zinc-900 antialiased selection:bg-[#d4af37]/25">
      <nav className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-500 ${scrolled || mobileMenuOpen
        ? 'border-[#d4af37]/20 bg-zinc-950/75 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl'
        : 'border-white/10 bg-black/20 backdrop-blur-md'
        }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <a
            href="/"
            className="text-lg font-semibold tracking-[0.08em] text-white outline-none transition hover:text-[#f6e7bd] focus-visible:ring-2 focus-visible:ring-[#d4af37]/80 md:text-2xl"
          >
            Brazil Signature Journey
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#journey"
              className="text-sm uppercase tracking-[0.18em] text-white/80 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#d4af37]/80"
            >
              Journey
            </a>

            <a
              href="#apply"
              className="text-sm uppercase tracking-[0.18em] text-white/80 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#d4af37]/80"
            >
              Apply
            </a>

            <a
              href="#apply"
              className="rounded-full border border-[#d4af37]/50 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white shadow-[0_12px_35px_rgba(0,0,0,0.15)] backdrop-blur-md outline-none transition hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-black focus-visible:ring-2 focus-visible:ring-[#d4af37]/80"
            >
              Start Your Journey
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white outline-none backdrop-blur-md transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-[#d4af37]/80 md:hidden"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative h-4 w-5">
              <span className={`absolute left-0 top-0 h-px w-5 bg-current transition ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`absolute left-0 top-2 h-px w-5 bg-current transition ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 top-4 h-px w-5 bg-current transition ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </span>
          </button>
        </div>

        <div className={`grid overflow-hidden transition-all duration-500 md:hidden ${mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="min-h-0">
            <div className="mx-5 mb-5 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
              <a onClick={() => setMobileMenuOpen(false)} href="#journey" className="block rounded-xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10 hover:text-white">
                Journey
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#apply" className="block rounded-xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10 hover:text-white">
                Apply
              </a>
              <a onClick={() => setMobileMenuOpen(false)} href="#apply" className="mt-2 block rounded-full border border-[#d4af37]/50 bg-[#d4af37] px-5 py-3 text-center text-sm font-medium uppercase tracking-[0.12em] text-black transition hover:bg-[#f0d57e]">
                Start Your Journey
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[720px] overflow-hidden text-white md:h-[88vh] md:min-h-[760px]">

        {/* SLIDES */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[1800ms] ease-out ${currentHero === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={image}
                alt={`Curated Brazil hero ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out ${currentHero === index ? 'scale-105' : 'scale-100'}`}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_45%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.28)_48%,rgba(0,0,0,0.62)),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.76))]" />
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="absolute inset-0 z-10 flex items-center pt-20">
          <motion.div
            className="mx-auto w-full max-w-7xl px-6"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >

            <div className="mb-8 h-px w-24 bg-[#d4af37]" />

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-balance drop-shadow-2xl md:text-6xl">
              Experience Brazil like few ever will — a private, curated journey
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">
              A 25-day premium experience designed for comfort, safety and unforgettable moments.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#apply"
                className="rounded-full bg-emerald-600 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] shadow-[0_18px_45px_rgba(5,150,105,0.28)] outline-none transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                Request Your Private Itinerary
              </a>

              <a
                href="#journey"
                className="rounded-full border border-white/70 bg-white/5 px-7 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] backdrop-blur-sm outline-none transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-white/80"
              >
                Discover the Journey
              </a>
            </div>

            <p className="mt-4 text-sm tracking-wide text-white/70">
              Limited availability — curated for a select group of travellers
            </p>

          </motion.div>
        </div>

        {/* DOTS */}
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3 rounded-full border border-white/15 bg-black/20 px-4 py-3 backdrop-blur-md">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`h-2.5 rounded-full transition-all duration-500 ${currentHero === index
                ? 'w-8 bg-[#d4af37]'
                : 'w-2.5 bg-white/45 hover:bg-white/75'
                }`}
              aria-label={`Curated Brazil hero ${index + 1}`}
            />
          ))}
        </div>

      </section >

      {/* JOURNEY */}
      < motion.section
        id="journey"
        className="mx-auto max-w-7xl px-6 py-20 md:py-28"
        initial={{ opacity: 0, y: 40 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="mb-12 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          A curated route across Brazil
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {destinations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/destino/${item.title
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
                className="group block transition duration-500 hover:-translate-y-2"
              >
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_18px_55px_rgba(24,24,27,0.08)] transition duration-500 group-hover:shadow-[0_28px_80px_rgba(24,24,27,0.16)]">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-70 transition duration-700 group-hover:opacity-90" />
                    <div className="absolute bottom-5 left-5 h-px w-12 origin-left scale-x-75 bg-[#d4af37] transition duration-500 group-hover:scale-x-100" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section >

      {/* WHAT'S INCLUDED */}
      < section className="mx-auto max-w-7xl px-6 py-20" >
        <h2 className="mb-8 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
          What’s included
        </h2>

        <div className="grid gap-3 text-zinc-700 md:grid-cols-2 [&>p]:rounded-2xl [&>p]:border [&>p]:border-black/5 [&>p]:bg-white [&>p]:px-5 [&>p]:py-4 [&>p]:shadow-sm">
          <p>✔ 4–5 star hotels and boutique stays</p>
          <p>✔ Domestic flights within Brazil</p>
          <p>✔ Private airport transfers</p>
          <p>✔ Local guides and curated experiences</p>
          <p>✔ Amazon, Pantanal and Bonito activities</p>
          <p>✔ Ilha Grande private boat experience</p>
          <p>✔ Selected meals included</p>
          <p>✔ Small group (6–10 travellers)</p>
        </div>
      </section >

      {/* WHY */}
      < section className="border-y border-black/5 bg-[#f3efe8] px-6 py-20" >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Why travellers say yes
          </h2>

          <div className="mt-8 space-y-6">

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(24,24,27,0.06)]">
              <h3 className="font-semibold text-lg">
                A truly unique itinerary
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                This journey combines Brazil’s most iconic destinations — from the Amazon and Pantanal to Rio de Janeiro, Minas Gerais and Ilha Grande — in a single, carefully designed route that very few travellers ever experience.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(24,24,27,0.06)]">
              <h3 className="font-semibold text-lg">
                Safety, comfort and peace of mind
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                The entire experience is fully hosted and professionally organised, with trusted local partners, private transfers and support throughout the journey — so you can focus on enjoying every moment without stress.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_18px_55px_rgba(24,24,27,0.06)]">
              <h3 className="font-semibold text-lg">
                Balanced luxury, not a rushed tour
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                This is not about visiting as many places as possible. It’s about experiencing each destination properly — with time, comfort and quality — creating a journey that feels exclusive, immersive and truly memorable.
              </p>
            </div>

          </div>
        </div>
      </section >

      {/* EXPERIENCE PRICING */}
      <section className="relative overflow-hidden border-y border-[#d4af37]/20 bg-[#11100d] px-6 py-18 text-white md:py-24 lg:py-26">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(212,175,55,0.16),transparent_26%),radial-gradient(circle_at_78%_0%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" />

        <motion.div
          className="relative mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#d4af37]">
              Limited departures • Small curated group • September 2026
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-balance md:text-5xl">
              Choose Your Experience
            </h2>
            <div className="mx-auto mt-5 h-px w-20 bg-[#d4af37]/80" />
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pricingExperiences.map((experience, index) => {
              const isOpen = openExperience === experience.id
              const detailsId = `${experience.id}-details`

              return (
                <motion.article
                  key={experience.id}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl transition duration-700 hover:-translate-y-2 hover:border-[#d4af37]/55 hover:bg-white/[0.075] hover:shadow-[0_36px_110px_rgba(0,0,0,0.46)] md:p-6 lg:p-7"
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.1, ease: 'easeOut' }}
                  viewport={{ once: true }}
                >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent opacity-60 transition duration-700 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#d4af37]/10 blur-3xl transition duration-700 group-hover:bg-[#d4af37]/16" />

                  <div className="relative flex min-h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="inline-flex rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f1d991]">
                          {experience.tag}
                        </p>
                        <h3 className="mt-5 text-2xl font-semibold tracking-[-0.01em] md:text-[1.7rem] md:leading-tight">
                          {experience.title}
                        </h3>
                      </div>

                      <div className="hidden h-14 w-14 shrink-0 rounded-full border border-[#d4af37]/35 bg-black/20 md:block" />
                    </div>

                    <p className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[#f8f2df] md:text-[2.8rem]">
                      {experience.price}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-white/70 md:text-[0.95rem]">
                      {experience.description}
                    </p>

                    {experience.highlight && (
                      <p className="mt-5 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-4 py-3 font-serif text-lg italic leading-7 text-[#f7e8bd]">
                        {experience.highlight}
                      </p>
                    )}

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setOpenExperience(isOpen ? '' : experience.id)}
                        className="flex w-full items-center justify-between rounded-full border border-white/15 bg-black/20 px-5 py-3.5 text-left text-sm font-medium uppercase tracking-[0.14em] text-white outline-none transition duration-300 hover:border-[#d4af37]/55 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#d4af37]/80"
                        aria-expanded={isOpen}
                        aria-controls={detailsId}
                      >
                        <span>Included</span>
                        <span className={`text-lg leading-none text-[#d4af37] transition duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                          +
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={detailsId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.42, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <ul className="grid gap-2.5 px-1 pb-1 pt-5 text-sm leading-6 text-white/76 sm:grid-cols-2">
                              {experience.included.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37]" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={openWhatsAppLeadModal}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#d4af37] px-7 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-black shadow-[0_20px_55px_rgba(212,175,55,0.22)] outline-none transition duration-300 hover:-translate-y-0.5 hover:bg-[#f0d57e] hover:shadow-[0_24px_70px_rgba(212,175,55,0.32)] focus-visible:ring-2 focus-visible:ring-[#f6e7bd]"
                    >
                      Join the Waitlist
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm uppercase tracking-[0.18em] text-[#f6e7bd]/80">
            Only 8 exclusive spots available for the inaugural journey.
          </p>
        </motion.div>
      </section>

      {/* FAQ */}
      < section className="border-y border-black/5 bg-[#f3efe8] px-6 py-20" >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-8 space-y-6">

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <h3 className="font-semibold text-lg">
                Are international flights included?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                International flights are not included by default. This gives you full flexibility to choose your preferred airline, departure city and travel class (economy or business).
                <br /><br />
                All domestic flights within Brazil are included in the package.
                <br /><br />
                If you prefer, we can include your international flights as part of your package with an adjusted final price. This option can be discussed during the booking process.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <h3 className="font-semibold text-lg">
                What is the group size?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                This is a small, premium group experience with approximately 6 to 10 travellers. This ensures a more personalised, comfortable and high-quality journey.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <h3 className="font-semibold text-lg">
                Is the trip safe?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Yes. The entire journey is carefully planned and hosted, with local partners, private transfers and support throughout the experience, providing safety and peace of mind.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
              <h3 className="font-semibold text-lg">
                Can I travel alone?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Absolutely. Solo travellers are very welcome. This experience is designed to be social, safe and enjoyable whether you are travelling alone, as a couple or with friends.
              </p>
            </div>

          </div>
        </div>
      </section >

      {/* FORM */}
      < section id="apply" className="relative overflow-hidden px-6 py-20 md:py-28" >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9c7a3c]">
              Inaugural Luxury Journey
            </p>
            <p className="mt-3 text-lg font-semibold tracking-[0.16em] text-zinc-900">
              September 4th, 2026
            </p>
            <div className="mx-auto mt-5 h-px w-20 bg-[#d4af37]/80" />
            <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">
              Only 8 curated guests
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-600 md:text-lg">
              Be part of the first Curated Brazil signature experience.
              <br />
              An exclusive inaugural journey through Brazil designed for a limited group of international guests seeking authenticity, comfort and unforgettable moments.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-[2rem] border border-[#d4af37]/20 bg-white shadow-[0_28px_80px_rgba(24,24,27,0.10)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[360px] overflow-hidden bg-[#11100d] p-8 text-white md:p-10">
                <img
                  src="/images/rio_de_janeiro1.webp"
                  alt="Curated Brazil private journey"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.82)),radial-gradient(circle_at_25%_20%,rgba(212,175,55,0.22),transparent_30%)]" />

                <div className="relative flex min-h-full flex-col justify-end">
                  <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f1d991]">
                    Private Journey Application
                  </p>
                  <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight md:text-5xl">
                    Start Your Private Journey
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-7 text-white/78 md:text-base">
                    A curated luxury experience designed around your travel dreams, comfort and personal style.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {applicationSuccess ? (
                  <motion.div
                    key="application-success"
                    className="flex min-h-full items-center p-6 md:p-9 lg:p-10"
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 8 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <div className="w-full rounded-[1.75rem] border border-[#d4af37]/25 bg-[#fbfaf7] px-6 py-8 text-center shadow-[0_22px_60px_rgba(24,24,27,0.08)] md:px-10 md:py-12">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/35 bg-[#d4af37]/10 text-[#9c7a3c] shadow-[0_14px_35px_rgba(212,175,55,0.14)]">
                        <FaCheck size={18} />
                      </div>

                      <p className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-[#9c7a3c]">
                        APPLICATION RECEIVED
                      </p>

                      <h3 className="mt-4 text-3xl font-semibold leading-tight text-zinc-900 md:text-4xl">
                        Your Journey Begins Here
                      </h3>

                      <div className="mx-auto mt-5 h-px w-16 bg-[#d4af37]/80" />

                      <div className="mx-auto mt-6 max-w-xl space-y-5 text-sm leading-7 text-zinc-600 md:text-base md:leading-8">
                        <p>
                          Thank you for your interest in joining Curated Brazil's inaugural luxury journey.
                        </p>
                        <p>
                          Our team will carefully review your application and contact you with the next steps.
                        </p>
                        <p>
                          You are now one step closer to experiencing Brazil through a private collection of unforgettable moments, authentic connections and extraordinary destinations.
                        </p>
                      </div>

                      <p className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/10 px-5 py-4 text-sm font-medium leading-7 text-zinc-700">
                        Selected guests will receive personalised communication by email and WhatsApp regarding availability, planning and journey details.
                      </p>

                      <button
                        type="button"
                        onClick={handleApplicationReset}
                        className="mt-8 w-full rounded-full bg-emerald-600 py-4 font-medium text-white shadow-[0_18px_45px_rgba(5,150,105,0.22)] outline-none transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/70"
                      >
                        I Can't Wait to Begin
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="application-form"
                    onSubmit={handleWhatsAppForm}
                    className="p-6 md:p-9 lg:p-10"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Full Name</span>
                    <input
                      name="fullName"
                      value={applicationForm.fullName}
                      onChange={handleApplicationChange}
                      required
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Email Address</span>
                    <input
                      name="email"
                      value={applicationForm.email}
                      onChange={handleApplicationChange}
                      required
                      type="email"
                      autoComplete="email"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left md:col-span-2">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">WhatsApp Number</span>
                    <input
                      name="whatsapp"
                      value={applicationForm.whatsapp}
                      onChange={handleApplicationChange}
                      required
                      type="tel"
                      autoComplete="tel"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Number of Travelers</span>
                    <select
                      name="travelers"
                      value={applicationForm.travelers}
                      onChange={handleApplicationChange}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    >
                      {travelerOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-4 text-left">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9c7a3c]">
                      Inaugural Luxury Journey
                    </p>
                    <p className="mt-2 text-base font-semibold tracking-[0.06em] text-zinc-900">
                      September 4th, 2026
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Only 8 curated guests
                    </p>
                  </div>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Have you visited Brazil before?</span>
                    <select
                      name="visitedBrazil"
                      value={applicationForm.visitedBrazil}
                      onChange={handleApplicationChange}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    >
                      {visitedBrazilOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Cities or regions visited</span>
                    <input
                      name="visitedPlaces"
                      value={applicationForm.visitedPlaces}
                      onChange={handleApplicationChange}
                      placeholder="If yes, where have you been?"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>
                </div>

                <fieldset className="mt-6">
                  <legend className="text-left text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    What type of experience are you looking for?
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {experienceOptions.map((interest) => {
                      const checked = applicationForm.interests.includes(interest)

                      return (
                        <label
                          key={interest}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${checked
                            ? 'border-[#d4af37]/70 bg-[#d4af37]/10 text-zinc-900'
                            : 'border-zinc-200 bg-[#fbfaf7] text-zinc-600 hover:border-[#d4af37]/50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleInterestToggle(interest)}
                            className="h-4 w-4 rounded border-zinc-300 accent-[#9c7a3c]"
                          />
                          <span>{interest}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                <label className="mt-6 block text-left">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Estimated Budget Range</span>
                  <select
                    name="budget"
                    value={applicationForm.budget}
                    onChange={handleApplicationChange}
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                  >
                    {budgetOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-6 block text-left">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Tell us about your dream experience in Brazil
                  </span>
                  <textarea
                    name="dreamExperience"
                    value={applicationForm.dreamExperience}
                    onChange={handleApplicationChange}
                    rows="5"
                    className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-7 w-full rounded-full bg-emerald-600 py-4 font-medium text-white shadow-[0_18px_45px_rgba(5,150,105,0.22)] outline-none transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/70 disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? 'Preparing Your Journey...' : 'Request My Journey'}
                </button>

                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section >
      {/* CONTACT */}
      < footer className="border-t border-[#c8a46b]/40 bg-[#f8f6f2] px-6 py-12" >
        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 md:grid-cols-4 md:items-start divide-y md:divide-y-0 md:divide-x divide-[#c8a46b]/20">

            {/* BRAND */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <img
                src="/images/logo-premium.png"
                alt="Curated Brazil"
                className="mx-auto h-40 w-auto rounded-3xl md:mx-0"
              />

              <h3 className="mt-5 text-xl font-semibold tracking-[0.18em] text-zinc-900">
                CURATED BRAZIL
              </h3>

              <div className="mt-4 h-px w-14 bg-[#c8a46b] mx-auto md:mx-0"></div>

              <p className="mt-5 max-w-xs text-sm leading-6 text-zinc-600">
                Premium journeys across Brazil designed with elegance, comfort and authenticity.
              </p>
            </div>

            {/* CONTACT */}
            <div className="md:pl-10">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9c7a3c]">
                Get in touch
              </h4>

              <div className="mt-6 space-y-4 text-sm text-zinc-700">
                <p>WhatsApp: +61 470 289 562</p>
                <p>hello@curatedbraziltravel.com</p>
              </div>
            </div>

            {/* EXPLORE */}
            <div className="md:pl-10">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9c7a3c]">
                Explore
              </h4>

              <div className="mt-6 space-y-4 text-sm text-zinc-700">
                <a href="#journey" className="block transition hover:text-[#9c7a3c]">
                  Journey
                </a>
                <a href="#apply" className="block transition hover:text-[#9c7a3c]">
                  Apply
                </a>
                <a href="#apply" className="block transition hover:text-[#9c7a3c]">
                  Start Your Journey
                </a>
                <Link to="/workspace" className="block text-xs uppercase tracking-[0.18em] text-zinc-500 transition hover:text-[#9c7a3c]">
                  Workspace
                </Link>
              </div>
            </div>

            {/* SOCIAL */}
            <div className="md:pl-6">
              <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9c7a3c]">
                Follow us
              </h4>

              <div className="mt-5 flex gap-4">

                <a
                  href="https://instagram.com/curatedbrazil"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a46b]/60 text-[#9c7a3c] transition hover:bg-[#c8a46b] hover:text-white"
                >
                  <FaInstagram size={16} />
                </a>

                <button
                  type="button"
                  onClick={openWhatsAppLeadModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a46b]/60 text-[#9c7a3c] transition hover:bg-[#c8a46b] hover:text-white"
                  aria-label="Open WhatsApp consultation"
                >
                  <FaWhatsapp size={16} />
                </button>

                <a
                  href="mailto:hello@curatedbraziltravel.com"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a46b]/60 text-[#9c7a3c] transition hover:bg-[#c8a46b] hover:text-white"
                >
                  <FaEnvelope size={15} />
                </a>

              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-zinc-300/70 pt-6 text-center">
            <p className="text-xs text-zinc-500">
              © 2026 Curated Brazil. All rights reserved.
            </p>
          </div>

        </div>
      </footer >
      <AnimatePresence>
        {whatsAppLeadModalOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-consultation-title"
          >
            <motion.div
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-[#d4af37]/25 bg-[#fbfaf7] shadow-[0_28px_90px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/80 to-transparent" />
              <button
                type="button"
                onClick={closeWhatsAppLeadModal}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-white/70 text-zinc-700 outline-none transition hover:border-[#d4af37] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-[#d4af37]/70"
                aria-label="Close consultation form"
              >
                ×
              </button>

              <div className="border-b border-[#d4af37]/20 bg-[#11100d] px-6 py-8 text-white md:px-9">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#f1d991]">
                  Curated Brazil
                </p>
                <h2 id="whatsapp-consultation-title" className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                  Private Travel Consultation
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/76 md:text-base">
                  Please tell us a little about yourself before connecting with a Curated Brazil Travel Specialist.
                </p>
              </div>

              <form onSubmit={handleWhatsAppLeadSubmit} className="p-6 md:p-9">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-left md:col-span-2">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Full Name</span>
                    <input
                      name="fullName"
                      value={whatsAppLeadForm.fullName}
                      onChange={handleWhatsAppLeadChange}
                      required
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Email Address</span>
                    <input
                      name="email"
                      value={whatsAppLeadForm.email}
                      onChange={handleWhatsAppLeadChange}
                      required
                      type="email"
                      autoComplete="email"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Country of Residence</span>
                    <input
                      name="countryOfResidence"
                      value={whatsAppLeadForm.countryOfResidence}
                      onChange={handleWhatsAppLeadChange}
                      required
                      autoComplete="country-name"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">City</span>
                    <input
                      name="city"
                      value={whatsAppLeadForm.city}
                      onChange={handleWhatsAppLeadChange}
                      autoComplete="address-level2"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Date of Birth</span>
                    <input
                      name="birthDate"
                      value={whatsAppLeadForm.birthDate}
                      onChange={handleWhatsAppLeadChange}
                      type="date"
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    />
                  </label>

                  <label className="block text-left md:col-span-2">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">How did you hear about Curated Brazil?</span>
                    <select
                      name="referralSource"
                      value={whatsAppLeadForm.referralSource}
                      onChange={handleWhatsAppLeadChange}
                      className="mt-2 w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15"
                    >
                      <option value="">Select an option</option>
                      {referralOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={whatsAppLeadLoading}
                  className="mt-7 w-full rounded-full bg-[#d4af37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-black shadow-[0_18px_45px_rgba(212,175,55,0.24)] outline-none transition hover:bg-[#f0d57e] focus-visible:ring-2 focus-visible:ring-[#d4af37]/70 disabled:cursor-wait disabled:opacity-70"
                >
                  {whatsAppLeadLoading ? 'Connecting...' : 'Continue to WhatsApp'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* FLOATING WHATSAPP */}
      <button
        type="button"
        onClick={openWhatsAppLeadModal}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-[0_10px_35px_rgba(37,211,102,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_15px_45px_rgba(37,211,102,0.45)]"
        aria-label="Open WhatsApp consultation"
      >
        <FaWhatsapp size={24} />

        <span className="hidden text-sm font-medium md:block">
          Chat with us
        </span>
      </button>
    </div >
  )
}
