import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { localeByCode, localeCatalog, rtlLocales } from './locales/catalog'
import { normaliseLocale, resolveLocale } from './locales/detection'

const STORAGE_KEY = 'curated-brazil.locale'
const COOKIE_KEY = 'curated_brazil_locale'

export const supportedLocales = localeCatalog

const copy = {
  'en-AU': {
    'seo.title': 'Curated Brazil Travel | Luxury Journeys in Brazil',
    'seo.description': 'Private and small-group premium journeys through Brazil, thoughtfully curated with cultural depth.',
    'language.label': 'Language',
    'language.change': 'Change language',
    'language.selected': 'Selected language',
    'language.search': 'Search languages',
    'language.noResults': 'No languages found',
    'translation.notice': 'Machine translation is provided for information only. English remains authoritative for legal and contractual terms.',
    'carousel.region': 'Carnaval Collection 2027 image carousel',
    'carousel.pause': 'Pause carousel',
    'carousel.resume': 'Resume carousel',
    'carousel.previous': 'Previous slide',
    'carousel.next': 'Next slide',
    'carousel.slide': 'Slide {current} of {total}',
    'image.aiDisclosure': 'Illustrative imagery generated with ChatGPT for Curated Brazil Travel; scenes are not documentary photographs or confirmed suppliers.',
    'nav.journey': 'Journey',
    'nav.apply': 'Apply',
    'nav.start': 'Start Your Journey',
    'nav.collection': 'The collection',
    'nav.enquiry': 'Private enquiry',
    'nav.signature': 'Signature Journey',
    'nav.menu': 'Toggle navigation',
    'home.hero.title': 'Experience Brazil like few ever will — a private, curated journey',
    'home.hero.copy': 'A 28-day premium experience designed for comfort, safety and unforgettable moments.',
    'home.hero.primary': 'Request Your Private Itinerary',
    'home.hero.secondary': 'Discover the Journey',
    'home.hero.note': 'Limited availability — curated for a select group of travellers',
    'home.route.title': 'A curated route across Brazil',
    'common.duration': 'Duration:',
    'common.group': 'Group:',
    'common.cities': 'Cities:',
    'common.maximum': 'Maximum {count} guests',
    'common.viewExperience': 'View experience',
    'common.close': 'Close',
    'carnaval.hero.eyebrow': 'A limited collection · February 2027',
    'carnaval.hero.title': 'Carnaval, curated beyond the obvious.',
    'carnaval.hero.copy': 'Three carefully curated journeys through Brazil’s most expressive season — created for travellers who want the energy of Carnaval with cultural context, premium comfort and personalised attention.',
    'carnaval.hero.explore': 'Explore the collection',
    'carnaval.hero.compare': 'Compare the journeys',
    'carnaval.perspective.eyebrow': 'The Curated Brazil perspective',
    'carnaval.perspective.title': 'Experience Carnaval Beyond the Ordinary.',
    'carnaval.journeys.eyebrow': 'Three ways into Carnaval',
    'carnaval.journeys.title': 'Choose the rhythm that feels like yours.',
    'carnaval.journeys.copy': 'Every journey has its own pace and cultural emphasis, with a dedicated enquiry form for a tailored quotation.',
    'carnaval.consultation.eyebrow': 'Personalised quotation',
    'carnaval.consultation.title': 'Choose your Carnaval journey.',
    'carnaval.consultation.copy': 'Each experience has a dedicated enquiry form, with the journey automatically identified for the Curated Brazil Travel team.',
    'carnaval.consultation.options': 'Your quotation options',
    'carnaval.consultation.optionsCopy': 'Select twin-share or single occupancy and choose whether you would like return international flights included.',
    'carnaval.footer.tagline': 'Luxury journeys with cultural depth.',
    'form.dedicated': 'Dedicated journey enquiry',
    'form.title': 'Enquire about this journey.',
    'form.intro': 'Tell us how you would like to travel. International airfare will be quoted personally from your departure city and is never calculated automatically.',
    'form.selectedPackage': 'Selected package',
    'form.fullName': 'Full Name',
    'form.email': 'Email',
    'form.phone': 'Phone / WhatsApp',
    'form.country': 'Country of Residence',
    'form.travellers': 'Number of Travellers',
    'form.accommodation': 'Preferred Accommodation',
    'form.flights': 'International Flights',
    'form.includeFlights': 'Include return international flights',
    'form.excludeFlights': 'Exclude international flights',
    'form.domesticFlights': 'All domestic flights in the itinerary are included with either option.',
    'form.departure': 'Departure City / Airport',
    'form.departurePlaceholder': 'For example, Sydney (SYD)',
    'form.message': 'Additional Requests / Message',
    'form.submit': 'Enquire About This Journey',
    'form.sending': 'Preparing enquiry…',
    'form.missingDeparture': 'Please provide your departure city or airport so international flights can be quoted.',
    'form.error': 'Your enquiry could not be sent. Please try again or email hello@curatedbraziltravel.com.',
    'form.success': 'Thank you. Your package-specific enquiry has been sent to Curated Brazil Travel.',
    'destination.back': 'Back to the journey',
    'destination.notFound': 'Destination not found',
    'destination.return': 'Return to Curated Brazil',
    'destination.explore': 'Explore Experiences',
    'workspace.label': 'Workspace',
  },
  'pt-BR': {
    'seo.title': 'Curated Brazil Travel | Jornadas de luxo pelo Brasil',
    'seo.description': 'Jornadas premium privativas e em pequenos grupos pelo Brasil, cuidadosamente planejadas com profundidade cultural.',
    'language.label': 'Idioma',
    'language.change': 'Alterar idioma',
    'language.selected': 'Idioma selecionado',
    'language.search': 'Buscar idiomas',
    'language.noResults': 'Nenhum idioma encontrado',
    'translation.notice': 'A tradução automática é fornecida apenas para fins informativos. O inglês continua sendo a versão oficial para termos jurídicos e contratuais.',
    'carousel.region': 'Carrossel de imagens da Carnaval Collection 2027',
    'carousel.pause': 'Pausar carrossel',
    'carousel.resume': 'Retomar carrossel',
    'carousel.previous': 'Slide anterior',
    'carousel.next': 'Próximo slide',
    'carousel.slide': 'Slide {current} de {total}',
    'image.aiDisclosure': 'Imagens ilustrativas geradas com o ChatGPT para a Curated Brazil Travel; as cenas não são fotografias documentais nem fornecedores confirmados.',
    'nav.journey': 'Jornada',
    'nav.apply': 'Inscreva-se',
    'nav.start': 'Comece sua jornada',
    'nav.collection': 'A coleção',
    'nav.enquiry': 'Consulta privada',
    'nav.signature': 'Jornada Signature',
    'nav.menu': 'Abrir ou fechar navegação',
    'home.hero.title': 'Viva o Brasil como poucos — em uma jornada privativa e cuidadosamente planejada',
    'home.hero.copy': 'Uma experiência premium de 28 dias, criada para oferecer conforto, segurança e momentos inesquecíveis.',
    'home.hero.primary': 'Solicite seu roteiro privativo',
    'home.hero.secondary': 'Conheça a jornada',
    'home.hero.note': 'Disponibilidade limitada — criada para um grupo seleto de viajantes',
    'home.route.title': 'Uma rota cuidadosamente planejada pelo Brasil',
    'common.duration': 'Duração:',
    'common.group': 'Grupo:',
    'common.cities': 'Cidades:',
    'common.maximum': 'Máximo de {count} hóspedes',
    'common.viewExperience': 'Ver experiência',
    'common.close': 'Fechar',
    'carnaval.hero.eyebrow': 'Uma coleção limitada · Fevereiro de 2027',
    'carnaval.hero.title': 'Carnaval, muito além do óbvio.',
    'carnaval.hero.copy': 'Três jornadas cuidadosamente planejadas pela época mais vibrante do Brasil — para quem deseja viver a energia do Carnaval com contexto cultural, conforto premium e atenção personalizada.',
    'carnaval.hero.explore': 'Conheça a coleção',
    'carnaval.hero.compare': 'Compare as jornadas',
    'carnaval.perspective.eyebrow': 'A perspectiva Curated Brazil',
    'carnaval.perspective.title': 'Viva o Carnaval além do comum.',
    'carnaval.journeys.eyebrow': 'Três maneiras de viver o Carnaval',
    'carnaval.journeys.title': 'Escolha o ritmo que combina com você.',
    'carnaval.journeys.copy': 'Cada jornada tem seu próprio ritmo e enfoque cultural, com um formulário exclusivo para uma cotação personalizada.',
    'carnaval.consultation.eyebrow': 'Cotação personalizada',
    'carnaval.consultation.title': 'Escolha sua jornada de Carnaval.',
    'carnaval.consultation.copy': 'Cada experiência tem um formulário exclusivo que identifica automaticamente a jornada para a equipe da Curated Brazil Travel.',
    'carnaval.consultation.options': 'Opções da sua cotação',
    'carnaval.consultation.optionsCopy': 'Escolha acomodação dupla ou individual e informe se deseja incluir voos internacionais de ida e volta.',
    'carnaval.footer.tagline': 'Jornadas de luxo com profundidade cultural.',
    'form.dedicated': 'Consulta exclusiva da jornada',
    'form.title': 'Consulte esta jornada.',
    'form.intro': 'Conte-nos como gostaria de viajar. A passagem internacional será cotada pessoalmente a partir da sua cidade de origem e nunca será calculada automaticamente.',
    'form.selectedPackage': 'Pacote selecionado',
    'form.fullName': 'Nome completo',
    'form.email': 'E-mail',
    'form.phone': 'Telefone / WhatsApp',
    'form.country': 'País de residência',
    'form.travellers': 'Número de viajantes',
    'form.accommodation': 'Acomodação preferida',
    'form.flights': 'Voos internacionais',
    'form.includeFlights': 'Incluir voos internacionais de ida e volta',
    'form.excludeFlights': 'Não incluir voos internacionais',
    'form.domesticFlights': 'Todos os voos domésticos do roteiro estão incluídos em ambas as opções.',
    'form.departure': 'Cidade / aeroporto de partida',
    'form.departurePlaceholder': 'Por exemplo, Sydney (SYD)',
    'form.message': 'Pedidos adicionais / mensagem',
    'form.submit': 'Consultar esta jornada',
    'form.sending': 'Preparando consulta…',
    'form.missingDeparture': 'Informe sua cidade ou aeroporto de partida para que os voos internacionais possam ser cotados.',
    'form.error': 'Não foi possível enviar sua consulta. Tente novamente ou envie um e-mail para hello@curatedbraziltravel.com.',
    'form.success': 'Obrigado. Sua consulta sobre este pacote foi enviada à Curated Brazil Travel.',
    'destination.back': 'Voltar à jornada',
    'destination.notFound': 'Destino não encontrado',
    'destination.return': 'Voltar à Curated Brazil',
    'destination.explore': 'Conheça as experiências',
    'workspace.label': 'Área de trabalho',
  },
  es: {
    'seo.title': 'Curated Brazil Travel | Viajes de lujo por Brasil',
    'seo.description': 'Viajes premium privados y en grupos pequeños por Brasil, cuidadosamente diseñados con profundidad cultural.',
    'language.label': 'Idioma',
    'language.change': 'Cambiar idioma',
    'language.selected': 'Idioma seleccionado',
    'language.search': 'Buscar idiomas',
    'language.noResults': 'No se encontraron idiomas',
    'translation.notice': 'La traducción automática se proporciona solo con fines informativos. El inglés sigue siendo la versión oficial para los términos legales y contractuales.',
    'carousel.region': 'Carrusel de imágenes de Carnaval Collection 2027',
    'carousel.pause': 'Pausar carrusel',
    'carousel.resume': 'Reanudar carrusel',
    'carousel.previous': 'Diapositiva anterior',
    'carousel.next': 'Diapositiva siguiente',
    'carousel.slide': 'Diapositiva {current} de {total}',
    'image.aiDisclosure': 'Imágenes ilustrativas generadas con ChatGPT para Curated Brazil Travel; las escenas no son fotografías documentales ni proveedores confirmados.',
    'nav.journey': 'Viaje',
    'nav.apply': 'Solicitud',
    'nav.start': 'Comienza tu viaje',
    'nav.collection': 'La colección',
    'nav.enquiry': 'Consulta privada',
    'nav.signature': 'Viaje Signature',
    'nav.menu': 'Abrir o cerrar la navegación',
    'home.hero.title': 'Vive Brasil como pocos — en un viaje privado y cuidadosamente diseñado',
    'home.hero.copy': 'Una experiencia premium de 28 días diseñada para ofrecer comodidad, seguridad y momentos inolvidables.',
    'home.hero.primary': 'Solicita tu itinerario privado',
    'home.hero.secondary': 'Descubre el viaje',
    'home.hero.note': 'Disponibilidad limitada — creada para un grupo selecto de viajeros',
    'home.route.title': 'Una ruta cuidadosamente diseñada por Brasil',
    'common.duration': 'Duración:',
    'common.group': 'Grupo:',
    'common.cities': 'Ciudades:',
    'common.maximum': 'Máximo de {count} huéspedes',
    'common.viewExperience': 'Ver experiencia',
    'common.close': 'Cerrar',
    'carnaval.hero.eyebrow': 'Una colección limitada · Febrero de 2027',
    'carnaval.hero.title': 'Carnaval, mucho más allá de lo evidente.',
    'carnaval.hero.copy': 'Tres viajes cuidadosamente diseñados por la temporada más expresiva de Brasil, para quienes buscan la energía del Carnaval con contexto cultural, comodidad premium y atención personalizada.',
    'carnaval.hero.explore': 'Explora la colección',
    'carnaval.hero.compare': 'Compara los viajes',
    'carnaval.perspective.eyebrow': 'La perspectiva Curated Brazil',
    'carnaval.perspective.title': 'Vive el Carnaval más allá de lo habitual.',
    'carnaval.journeys.eyebrow': 'Tres maneras de vivir el Carnaval',
    'carnaval.journeys.title': 'Elige el ritmo que más te representa.',
    'carnaval.journeys.copy': 'Cada viaje tiene su propio ritmo y enfoque cultural, con un formulario específico para una cotización personalizada.',
    'carnaval.consultation.eyebrow': 'Cotización personalizada',
    'carnaval.consultation.title': 'Elige tu viaje de Carnaval.',
    'carnaval.consultation.copy': 'Cada experiencia tiene un formulario específico que identifica automáticamente el viaje para el equipo de Curated Brazil Travel.',
    'carnaval.consultation.options': 'Opciones de tu cotización',
    'carnaval.consultation.optionsCopy': 'Elige habitación doble o individual e indica si deseas incluir vuelos internacionales de ida y vuelta.',
    'carnaval.footer.tagline': 'Viajes de lujo con profundidad cultural.',
    'form.dedicated': 'Consulta exclusiva del viaje',
    'form.title': 'Consulta sobre este viaje.',
    'form.intro': 'Cuéntanos cómo te gustaría viajar. La tarifa aérea internacional se cotizará personalmente desde tu ciudad de salida y nunca se calculará automáticamente.',
    'form.selectedPackage': 'Paquete seleccionado',
    'form.fullName': 'Nombre completo',
    'form.email': 'Correo electrónico',
    'form.phone': 'Teléfono / WhatsApp',
    'form.country': 'País de residencia',
    'form.travellers': 'Número de viajeros',
    'form.accommodation': 'Alojamiento preferido',
    'form.flights': 'Vuelos internacionales',
    'form.includeFlights': 'Incluir vuelos internacionales de ida y vuelta',
    'form.excludeFlights': 'Excluir vuelos internacionales',
    'form.domesticFlights': 'Todos los vuelos nacionales del itinerario están incluidos con ambas opciones.',
    'form.departure': 'Ciudad / aeropuerto de salida',
    'form.departurePlaceholder': 'Por ejemplo, Sídney (SYD)',
    'form.message': 'Solicitudes adicionales / mensaje',
    'form.submit': 'Consultar este viaje',
    'form.sending': 'Preparando consulta…',
    'form.missingDeparture': 'Indica tu ciudad o aeropuerto de salida para poder cotizar los vuelos internacionales.',
    'form.error': 'No se pudo enviar tu consulta. Inténtalo de nuevo o escribe a hello@curatedbraziltravel.com.',
    'form.success': 'Gracias. Tu consulta sobre este paquete fue enviada a Curated Brazil Travel.',
    'destination.back': 'Volver al viaje',
    'destination.notFound': 'Destino no encontrado',
    'destination.return': 'Volver a Curated Brazil',
    'destination.explore': 'Explora las experiencias',
    'workspace.label': 'Espacio de trabajo',
  },
}

export const translationResources = { ...copy }

const generatedLocaleLoaders = import.meta.glob('./locales/generated/*.json', { import: 'default' })

async function loadLocaleResource(locale) {
  const loader = generatedLocaleLoaders[`./locales/generated/${locale}.json`]
  if (!loader) return null
  const payload = await loader()
  if (!payload?.complete) return null
  return {
    ...payload.interface,
    __complete: true,
    __sourceTranslations: payload.sourceTranslations || {},
  }
}

const I18nContext = createContext(null)

function readCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function getSavedLocale() {
  return localStorage.getItem(STORAGE_KEY) || readCookie()
}

function getBrowserLanguages() {
  return navigator.languages?.length ? navigator.languages : [navigator.language].filter(Boolean)
}

function getPreviewLocale() {
  const preview = new URLSearchParams(window.location.search).get('localePreview')
  return localeByCode[preview]?.selectable ? preview : null
}

function detectImmediateLocale() {
  const preview = getPreviewLocale()
  if (preview) return preview

  const saved = getSavedLocale()
  if (saved) return resolveLocale({ saved, country: 'AU' }) || 'en-AU'

  const cachedCountry = sessionStorage.getItem('curated-brazil.country') || ''
  return resolveLocale({ browserLanguages: getBrowserLanguages(), country: cachedCountry })
}

async function fetchCountrySignal() {
  const cached = sessionStorage.getItem('curated-brazil.country')
  if (cached) return cached

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 1200)
  try {
    const response = await fetch('/api/country', { credentials: 'same-origin', signal: controller.signal })
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return ''
    const payload = await response.json()
    const country = /^[A-Z]{2}$/.test(payload?.country || '') ? payload.country : ''
    if (country) sessionStorage.setItem('curated-brazil.country', country)
    return country
  } catch {
    return ''
  } finally {
    window.clearTimeout(timeout)
  }
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectImmediateLocale)
  const [resources, setResources] = useState(translationResources)

  useEffect(() => {
    if (locale) return undefined
    let active = true
    fetchCountrySignal().then((country) => {
      if (!active) return
      setLocaleState(resolveLocale({ browserLanguages: getBrowserLanguages(), country }) || 'en-AU')
    })
    return () => { active = false }
  }, [locale])

  const setLocale = useCallback((nextLocale) => {
    const normalised = normaliseLocale(nextLocale, 'AU') || 'en-AU'
    const supported = localeByCode[normalised]?.selectable ? normalised : 'en-AU'
    localStorage.setItem(STORAGE_KEY, supported)
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(supported)}; Max-Age=31536000; Path=/; SameSite=Lax`
    setLocaleState(supported)
  }, [])

  useEffect(() => {
    if (!locale) return undefined
    const contentLocale = localeByCode[locale]?.contentLocale || locale
    if (contentLocale === 'en-AU' || resources[contentLocale]?.__complete) return undefined

    let active = true
    loadLocaleResource(contentLocale).then((resource) => {
      if (active && resource) setResources((current) => ({ ...current, [contentLocale]: resource }))
    })
    return () => { active = false }
  }, [locale, resources])

  const contentLocale = localeByCode[locale]?.contentLocale || locale
  const activeResource = resources[contentLocale] || resources[locale] || {}
  const sourceTranslations = activeResource.__sourceTranslations || {}

  useEffect(() => {
    if (!locale || contentLocale === 'en-AU' || window.location.pathname.startsWith('/workspace')) return undefined
    if (!Object.keys(sourceTranslations).length) return undefined

    const textRecords = new Map()
    const attributeRecords = new Map()
    const translatableAttributes = ['alt', 'aria-label', 'placeholder', 'title']
    const normalise = (value) => value.replace(/\s+/g, ' ').trim()
    const isExcluded = (node) => node.parentElement?.closest('script, style, [data-no-public-i18n]')

    const translateTextNode = (node) => {
      if (!node?.nodeValue || isExcluded(node)) return
      const source = normalise(node.nodeValue)
      const translated = sourceTranslations[source]
      if (!translated || translated === source) return
      if (!textRecords.has(node)) textRecords.set(node, node.nodeValue)
      const leading = node.nodeValue.match(/^\s*/u)?.[0] || ''
      const trailing = node.nodeValue.match(/\s*$/u)?.[0] || ''
      node.nodeValue = `${leading}${translated}${trailing}`
    }

    const translateAttributes = (element) => {
      if (!(element instanceof Element) || element.closest('script, style, [data-no-public-i18n]')) return
      for (const attribute of translatableAttributes) {
        const value = element.getAttribute(attribute)
        const translated = value && sourceTranslations[normalise(value)]
        if (!translated || translated === value) continue
        const key = `${attribute}`
        if (!attributeRecords.has(element)) attributeRecords.set(element, new Map())
        const records = attributeRecords.get(element)
        if (!records.has(key)) records.set(key, value)
        element.setAttribute(attribute, translated)
      }
    }

    const translateTree = (root) => {
      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root)
        return
      }
      if (!(root instanceof Element)) return
      translateAttributes(root)
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node)
        else translateAttributes(node)
        node = walker.nextNode()
      }
    }

    translateTree(document.body)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') translateTextNode(mutation.target)
        if (mutation.type === 'attributes') translateAttributes(mutation.target)
        for (const node of mutation.addedNodes) translateTree(node)
      }
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttributes,
    })

    return () => {
      observer.disconnect()
      for (const [node, value] of textRecords) if (node.isConnected) node.nodeValue = value
      for (const [element, records] of attributeRecords) {
        if (!element.isConnected) continue
        for (const [attribute, value] of records) element.setAttribute(attribute, value)
      }
    }
  }, [contentLocale, locale, sourceTranslations])

  useEffect(() => {
    if (!locale) return
    document.documentElement.lang = locale
    document.documentElement.dir = rtlLocales.has(locale) ? 'rtl' : 'ltr'
    document.documentElement.dataset.locale = locale
    const resource = resources[localeByCode[locale]?.contentLocale || locale] || resources[locale] || {}
    document.title = resource['seo.title'] || copy['en-AU']['seo.title']
    document.querySelector('meta[name="description"]')?.setAttribute('content', resource['seo.description'] || copy['en-AU']['seo.description'])
  }, [locale, resources])

  const t = useCallback((key, variables = {}) => {
    const contentLocale = localeByCode[locale]?.contentLocale || locale
    const template = resources[contentLocale]?.[key] ?? resources[locale]?.[key] ?? copy['en-AU'][key] ?? key
    return Object.entries(variables).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      template,
    )
  }, [locale, resources])

  const translateSource = useCallback((source) => sourceTranslations[source] || source, [sourceTranslations])

  const localeMeta = localeByCode[locale] || localeCatalog[0]
  const value = useMemo(
    () => ({ locale, localeMeta, setLocale, t, translateSource, supportedLocales }),
    [locale, localeMeta, setLocale, t, translateSource],
  )

  if (!locale) return <div className="i18n-boot" aria-busy="true" aria-label="Loading language preferences" />

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

export function TranslationDisclosure() {
  const { pathname } = useLocation()
  const { locale, t } = useI18n()
  if (locale.startsWith('en-') || pathname.startsWith('/workspace')) return null
  return (
    <aside className="translation-disclosure" role="note">
      {t('translation.notice')}
    </aside>
  )
}
