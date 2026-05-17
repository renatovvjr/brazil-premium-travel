import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { supabase } from './lib/supabase'
import { Link } from 'react-router-dom'


export default function App() {
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
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

  const handleWhatsAppForm = async () => {
    const firstName = document.getElementById('firstName')?.value || ''
    const email = document.getElementById('email')?.value || ''

    if (!firstName || !email) {
      alert('Please fill in your details')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('leads')
      .insert([
        {
          first_name: firstName,
          email: email,
          message: 'Lead from landing page'
        }
      ])

    if (error) {
      console.error(error)
      alert('Error saving lead')
      setLoading(false)
      return
    }

    const text = `Hi Renato, I'm interested in the Brazil Ultimate Signature Journey.\nName: ${firstName}\nEmail: ${email}`

    window.location.href =
      `https://wa.me/61470289562?text=${encodeURIComponent(text)}`
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

      {/* PRICING */}
      < section className="mx-auto max-w-5xl px-6 py-20" >
        <h2 className="mb-8 text-3xl font-semibold leading-tight md:text-4xl">
          Premium value for a once-in-a-lifetime experience
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* MAIN PRICE */}
          <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-[0_18px_55px_rgba(24,24,27,0.08)]">
            <h3 className="text-lg font-semibold">Standard Price</h3>
            <p className="mt-4 text-4xl font-bold">AUD 32,900</p>
            <p className="text-gray-500">per person</p>
          </div>

          {/* EARLY ACCESS */}
          <div className="rounded-2xl bg-emerald-700 p-8 text-white shadow-[0_28px_80px_rgba(4,120,87,0.25)] ring-1 ring-emerald-300/20">
            <p className="uppercase text-sm text-emerald-200">Early Access</p>
            <p className="text-4xl font-bold mt-2">AUD 29,900</p>

            <p className="mt-3 text-emerald-100">
              Reserved for the first 3 travellers only
            </p>

            <a
              href="#apply"
              className="mt-6 block rounded-full bg-white py-3 text-center font-medium text-emerald-700 outline-none transition hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Secure Early Access
            </a>
          </div>

        </div>
      </section >

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
      < section id="apply" className="px-6 py-20" >
        <div className="mx-auto max-w-xl rounded-3xl border border-black/5 bg-white p-6 text-center shadow-[0_28px_80px_rgba(24,24,27,0.10)] md:p-10">
          <h2 className="text-3xl font-semibold leading-tight">
            Request your private itinerary
          </h2>

          <div className="mt-8 space-y-4">
            <input id="firstName" placeholder="Your name" autoComplete="name" className="w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15" />
            <input id="email" placeholder="Your email" type="email" autoComplete="email" className="w-full rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 outline-none transition focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/15" />

            <button
              onClick={handleWhatsAppForm}
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 py-4 font-medium text-white shadow-[0_18px_45px_rgba(5,150,105,0.22)] outline-none transition hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/70 disabled:cursor-wait disabled:opacity-70"
            >
              Continue via WhatsApp
            </button>
          </div>
        </div>
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
                <p>curatedbrazil@gmail.com</p>
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

                <a
                  href="https://wa.me/61470289562"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a46b]/60 text-[#9c7a3c] transition hover:bg-[#c8a46b] hover:text-white"
                >
                  <FaWhatsapp size={16} />
                </a>

                <a
                  href="mailto:curatedbrazil@gmail.com"
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
      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/61470289562"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-[0_10px_35px_rgba(37,211,102,0.35)] transition duration-300 hover:scale-105 hover:shadow-[0_15px_45px_rgba(37,211,102,0.45)]"
      >
        <FaWhatsapp size={24} />

        <span className="hidden text-sm font-medium md:block">
          Chat with us
        </span>
      </a>
    </div >
  )
}
