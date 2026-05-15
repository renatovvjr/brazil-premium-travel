import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import { Link } from 'react-router-dom'

export default function App() {
  const [loading, setLoading] = useState(false)

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a
            href="/"
            className="text-xl font-semibold tracking-wide text-white"
          >
            Brazil Signature Journey
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#journey"
              className="text-sm text-white/90 transition hover:text-white"
            >
              Journey
            </a>

            <a
              href="#apply"
              className="text-sm text-white/90 transition hover:text-white"
            >
              Apply
            </a>

            <a
              href="#apply"
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition hover:scale-105"
            >
              Start Your Journey
            </a>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative min-h-screen text-white"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.75)), url('/images/rio_de_janeiro.background.webp')",
          backgroundSize: 'cover',
          backgroundPosition: '20% center',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-28">
          <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl">
            Experience Brazil like few ever will — a private, curated journey
          </h1>

          <p className="mt-6 text-lg max-w-2xl text-white/90">
            A 25-day premium experience designed for comfort, safety and unforgettable moments.
          </p>

          <div className="mt-8 flex gap-4">
            <a href="#apply" className="bg-emerald-600 px-6 py-3 rounded-xl hover:scale-105 transition">
              Request Your Private Itinerary
            </a>

            <a href="#journey" className="border border-white px-6 py-3 rounded-xl">
              Discover the Journey
            </a>
          </div>

          <p className="mt-3 text-sm text-white/70">
            Limited availability — curated for a select group of travellers
          </p>
        </div>
      </section>

      {/* JOURNEY */}
      <motion.section
        id="journey"
        className="py-16 px-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-semibold mb-10">
          A curated route across Brazil
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {destinations.map((item) => (
            <Link
              key={item.title}
              to={`/destino/${item.title
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/\s+/g, '-')}`}
              className="block hover:scale-105 transition"
            >
              <div className="bg-white rounded-xl shadow">
                <img src={item.image} className="h-56 w-full object-cover rounded-t-xl" />
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{item.text}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* WHAT'S INCLUDED */}
      <section className="mx-auto max-w-7xl px-6 py-16">
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
      </section>

      {/* WHY */}
      <section className="bg-gray-50 py-16 px-6">
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
      </section>

      {/* PRICING */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
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
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 px-6">
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
      </section>

      {/* FORM */}
      <section id="apply" className="py-16 px-6">
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
      </section>
      {/* CONTACT */}
      <section className="border-t border-[#c8a46b] bg-[#f8f6f2] px-6 py-16">
        <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-16 items-start">

          <img
            src="/images/logo.jpeg"
            alt="Curated Brazil"
            className="h-48 md:h-56 w-auto"
          />

          <p className="mt-4 text-zinc-600">
            Premium journeys across Brazil designed with elegance, comfort and authenticity.
          </p>

          <div className="mt-6 space-y-2 text-sm text-zinc-500">
            <p>WhatsApp: +61 470 289 562</p>
            <p>curatedbrazil@gmail.com</p>
          </div>

          <p className="mt-8 text-xs text-zinc-400">
            © 2026 Curated Brazil. All rights reserved.
          </p>

        </div>
      </section>
    </div>
  )
}