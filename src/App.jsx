import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { supabase } from './lib/supabase'
import { Link } from 'react-router-dom'


export default function App() {
  const [loading, setLoading] = useState(false)
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
    <div className="min-h-screen bg-white text-zinc-900">
      <nav className="fixed top-0 left-0 z-50 w-full bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto flex items-center justify-between px-8 py-4">

          <a
            href="/"
            className="text-2xl font-semibold tracking-[0.08em] text-white"
          >
            Brazil Signature Journey
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#journey"
              className="text-sm uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
            >
              Journey
            </a>

            <a
              href="#apply"
              className="text-sm uppercase tracking-[0.18em] text-white/80 transition hover:text-white"
            >
              Apply
            </a>

            <a
              href="#apply"
              className="rounded-full border border-[#d4af37]/50 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md transition hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-black"
            >
              Start Your Journey
            </a>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-[82vh] overflow-hidden text-white">

        {/* SLIDES */}
        <div
          className="flex h-full transition-transform duration-[1800ms] ease-in-out"
          style={{
            transform: `translateX(-${currentHero * 100}vw)`,
          }}
        >
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="relative h-full w-screen flex-shrink-0 overflow-hidden"
            >
              <img
                src={image}
                alt={`Curated Brazil hero ${index + 1}`}
                className="h-full w-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="absolute inset-0 z-10 flex items-center">
          <motion.div
            className="mx-auto max-w-7xl px-6"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >

            <h1 className="max-w-3xl text-4xl font-semibold md:text-6xl">
              Experience Brazil like few ever will — a private, curated journey
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/90">
              A 25-day premium experience designed for comfort, safety and unforgettable moments.
            </p>

            <div className="mt-8 flex gap-4">
              <a
                href="#apply"
                className="rounded-xl bg-emerald-600 px-6 py-3 transition hover:scale-105"
              >
                Request Your Private Itinerary
              </a>

              <a
                href="#journey"
                className="rounded-xl border border-white px-6 py-3"
              >
                Discover the Journey
              </a>
            </div>

            <p className="mt-3 text-sm text-white/70">
              Limited availability — curated for a select group of travellers
            </p>

          </motion.div>
        </div>

        {/* DOTS */}
        <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`h-3 w-3 rounded-full transition-all ${currentHero === index
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/70'
                }`}
            />
          ))}
        </div>

      </section >

      {/* JOURNEY */}
      < motion.section
        id="journey"
        className="py-16 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 40 }
        }
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-semibold mb-10">
          A curated route across Brazil
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
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
                <div className="overflow-hidden rounded-2xl bg-white shadow-md transition duration-500 group-hover:shadow-2xl">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-60 transition duration-700 group-hover:opacity-80" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{item.text}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section >

      {/* WHAT'S INCLUDED */}
      < section className="mx-auto max-w-7xl px-6 py-16" >
        <h2 className="text-3xl font-semibold mb-6">
          What’s included
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
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
      < section className="bg-gray-50 py-16 px-6" >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold">
            Why travellers say yes
          </h2>

          <div className="mt-8 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                A truly unique itinerary
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                This journey combines Brazil’s most iconic destinations — from the Amazon and Pantanal to Rio de Janeiro, Minas Gerais and Ilha Grande — in a single, carefully designed route that very few travellers ever experience.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                Safety, comfort and peace of mind
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                The entire experience is fully hosted and professionally organised, with trusted local partners, private transfers and support throughout the journey — so you can focus on enjoying every moment without stress.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
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
      < section className="py-16 px-6 max-w-5xl mx-auto" >
        <h2 className="text-3xl font-semibold mb-6">
          Premium value for a once-in-a-lifetime experience
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          {/* MAIN PRICE */}
          <div className="bg-white p-8 rounded-2xl shadow">
            <h3 className="text-lg font-semibold">Standard Price</h3>
            <p className="mt-4 text-4xl font-bold">AUD 32,900</p>
            <p className="text-gray-500">per person</p>
          </div>

          {/* EARLY ACCESS */}
          <div className="bg-emerald-700 text-white p-8 rounded-2xl shadow-xl">
            <p className="uppercase text-sm text-emerald-200">Early Access</p>
            <p className="text-4xl font-bold mt-2">AUD 29,900</p>

            <p className="mt-3 text-emerald-100">
              Reserved for the first 3 travellers only
            </p>

            <a
              href="#apply"
              className="mt-6 block bg-white text-emerald-700 py-3 rounded-xl text-center font-medium"
            >
              Secure Early Access
            </a>
          </div>

        </div>
      </section >

      {/* FAQ */}
      < section className="bg-gray-50 py-16 px-6" >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold">
            Frequently asked questions
          </h2>

          <div className="mt-8 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
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

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                What is the group size?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                This is a small, premium group experience with approximately 6 to 10 travellers. This ensures a more personalised, comfortable and high-quality journey.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg">
                Is the trip safe?
              </h3>
              <p className="mt-2 text-gray-600 leading-7">
                Yes. The entire journey is carefully planned and hosted, with local partners, private transfers and support throughout the experience, providing safety and peace of mind.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
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
      < section id="apply" className="py-16 px-6" >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold">
            Request your private itinerary
          </h2>

          <div className="mt-8 space-y-4">
            <input id="firstName" placeholder="Your name" className="w-full border p-3 rounded-lg" />
            <input id="email" placeholder="Your email" className="w-full border p-3 rounded-lg" />

            <button
              onClick={handleWhatsAppForm}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl"
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
    </div >
  )
}