import { motion } from 'framer-motion'
import { ArrowDown, Check, MapPin } from 'lucide-react'
import { carnavalDestinations } from './carnavalContent'
import { reveal } from './CarnavalShared'

export function ResponsiveCarnavalImage({ image, alt, className = '', eager = false }) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={image.mobile} />
      <img
        src={image.desktop}
        alt={alt}
        className={className}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </picture>
  )
}

function DestinationTop({ destination, compact = false }) {
  if (destination.topImages) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {destination.topImages.map((item) => (
          <figure key={item.city} className="group relative overflow-hidden rounded-[1.6rem] bg-[#07152d] shadow-[0_24px_70px_rgba(7,21,45,0.18)]">
            <picture>
              <source media="(max-width: 767px)" srcSet={item.image.chapter} />
              <img
                src={item.image.chapter}
                alt={item.alt}
                className={`w-full object-cover transition duration-700 group-hover:scale-[1.025] ${compact ? 'md:aspect-[4/3]' : 'md:aspect-[3/2]'}`}
                loading="lazy"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050b1b]/80 via-transparent to-transparent" />
            <figcaption className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f0d78e]">Minas Gerais</span>
              <span className="mt-1 block text-2xl font-semibold">{item.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-[1.8rem] bg-[#07152d] shadow-[0_24px_70px_rgba(7,21,45,0.18)] ${compact ? 'h-[22rem] md:h-[30rem]' : 'h-[28rem] md:h-[38rem]'}`}>
      <ResponsiveCarnavalImage image={destination.topImage} alt={destination.topAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050b1b]/60 via-transparent to-transparent" />
    </div>
  )
}

export function DestinationDiscovery({ destinationIds }) {
  return (
    <section id="destinations" className="bg-[#f7f5f1] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="grid gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#a31965]">Discover the destinations</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Four expressions of one extraordinary season.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#536078] md:justify-self-end">
            From samba and frevo to Minas street culture and Bahia’s blocos afro, every place tells Carnaval through its own music, memory, food and landscape.
          </p>
        </motion.div>

        <div className="mt-16 space-y-20 md:space-y-28">
          {destinationIds.map((id, index) => {
            const destination = carnavalDestinations[id]
            return (
              <motion.article key={id} id={`discover-${id}`} {...reveal} className="scroll-mt-8">
                <div className="mb-8 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#a31965]">{destination.eyebrow}</p>
                    <h3 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">{destination.title}</h3>
                  </div>
                  <p className="text-lg leading-8 text-[#59657a]">{destination.introduction}</p>
                </div>
                <DestinationTop destination={destination} compact />
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#536078]">
                  <span className="rounded-full border border-[#07152d]/10 bg-white px-4 py-2">History, culture & lifestyle</span>
                  <span className="rounded-full border border-[#07152d]/10 bg-white px-4 py-2">Why travellers love it</span>
                  <span className="rounded-full border border-[#07152d]/10 bg-white px-4 py-2">Experiences & highlights</span>
                </div>
                {index < destinationIds.length - 1 && <div className="mx-auto mt-16 flex h-11 w-11 items-center justify-center rounded-full border border-[#07152d]/10 text-[#a31965]"><ArrowDown size={17} /></div>}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function EditorialGallery({ destination }) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {destination.gallery.map((item, index) => (
        <figure key={item.label} className={`group relative overflow-hidden rounded-[1.5rem] bg-[#07152d] ${index === 1 ? 'md:translate-y-6' : ''}`}>
          <img src={item.image.chapter} alt={item.alt} className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b1b]/85 via-transparent to-transparent" />
          <figcaption className="absolute bottom-0 left-0 right-0 p-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">{item.label}</figcaption>
        </figure>
      ))}
    </div>
  )
}

export function DestinationEditorial({ destinationId, index = 0 }) {
  const destination = carnavalDestinations[destinationId]
  const dark = index % 2 === 1

  return (
    <section id={`destination-${destination.id}`} className={`scroll-mt-8 px-5 py-20 md:px-8 md:py-28 ${dark ? 'bg-[#07152d] text-white' : 'bg-[#f7f5f1] text-[#07152d]'}`}>
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="max-w-5xl">
          <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${dark ? 'text-[#e2c97f]' : 'text-[#a31965]'}`}>{destination.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.025em] md:text-6xl">{destination.title}</h2>
          <p className={`mt-6 max-w-3xl text-lg leading-8 ${dark ? 'text-white/68' : 'text-[#536078]'}`}>{destination.introduction}</p>
        </motion.div>

        <motion.div {...reveal} className="mt-12"><DestinationTop destination={destination} /></motion.div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <motion.div {...reveal}>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${dark ? 'text-[#e2c97f]' : 'text-[#a31965]'}`}>History, Culture and Lifestyle</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">The traditions behind the celebration.</h3>
          </motion.div>
          <motion.div {...reveal} className={dark ? 'text-white/68' : 'text-[#536078]'}>
            <p className="text-lg leading-8">{destination.history.intro}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {destination.history.cities.map((city) => (
                <div key={city.name} className={`rounded-[1.5rem] border p-6 ${dark ? 'border-white/10 bg-white/[0.055]' : 'border-[#07152d]/10 bg-white'}`}>
                  <p className={`flex items-center gap-2 font-semibold ${dark ? 'text-white' : 'text-[#07152d]'}`}><MapPin size={17} className={dark ? 'text-[#e2c97f]' : 'text-[#a31965]'} />{city.name}</p>
                  <p className="mt-3 leading-7">{city.copy}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div {...reveal} className={`mt-16 overflow-hidden rounded-[2rem] border p-7 md:p-11 ${dark ? 'border-[#d7b866]/25 bg-[linear-gradient(135deg,rgba(215,184,102,0.12),rgba(192,38,123,0.13))]' : 'border-[#07152d]/10 bg-white shadow-[0_24px_75px_rgba(7,21,45,0.08)]'}`}>
          <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${dark ? 'text-[#e2c97f]' : 'text-[#a31965]'}`}>Why this Carnaval?</p>
          <h3 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-4xl">{destination.whyTitle}</h3>
          <p className={`mt-6 max-w-4xl text-lg leading-8 ${dark ? 'text-white/68' : 'text-[#536078]'}`}>{destination.why}</p>
        </motion.div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <motion.div {...reveal}>
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${dark ? 'text-[#e2c97f]' : 'text-[#a31965]'}`}>Experiences and Highlights</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Ways to encounter the destination.</h3>
          </motion.div>
          <motion.div {...reveal} className="space-y-4">
            {destination.experiences.map((experience) => (
              <div key={experience} className={`flex gap-4 border-b pb-4 last:border-0 ${dark ? 'border-white/10 text-white/70' : 'border-[#07152d]/10 text-[#536078]'}`}>
                <span className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-[#d7b866]/15 text-[#e2c97f]' : 'bg-[#c0267b]/10 text-[#a31965]'}`}><Check size={14} /></span>
                <p className="leading-7">{experience}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <EditorialGallery destination={destination} />
      </div>
    </section>
  )
}
