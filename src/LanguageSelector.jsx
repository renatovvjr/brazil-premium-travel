import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Languages, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useI18n } from './i18n'

export function LanguageSelector({ compact = false, tone = 'dark', className = '' }) {
  const { locale, setLocale, supportedLocales, t } = useI18n()
  const [open, setOpen] = useState(() => ['language', 'mobile'].includes(new URLSearchParams(window.location.search).get('visualReview')))
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const selected = supportedLocales.find((item) => item.code === locale) || supportedLocales[0]
  const publicLocales = useMemo(() => supportedLocales.filter((item) => item.selectable), [supportedLocales])
  const filteredLocales = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    if (!search) return publicLocales
    return publicLocales.filter((item) => [item.name, item.englishName, item.code]
      .some((value) => value.toLocaleLowerCase().includes(search)))
  }, [publicLocales, query])

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const focusOption = (index) => {
    if (!filteredLocales.length) return
    const next = (index + filteredLocales.length) % filteredLocales.length
    optionRefs.current[next]?.focus()
  }

  const handleOptionKeyDown = (event, index, item) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOption(index + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(index - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusOption(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusOption(filteredLocales.length - 1)
    } else if ((event.key === 'Enter' || event.key === ' ') && item.selectable) {
      event.preventDefault()
      setLocale(item.code)
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  const light = tone === 'light'

  return (
    <div ref={rootRef} className={`language-selector ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`language-selector__trigger ${light ? 'language-selector__trigger--light' : ''}`}
        aria-label={`${t('language.change')}: ${selected.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <img className="locale-flag" src={`/flags/${selected.country}.svg`} alt="" aria-hidden="true" />
        {!compact && <Languages size={15} aria-hidden="true" />}
        {!compact && <span className="language-selector__code">{selected.short}</span>}
        <ChevronDown size={14} aria-hidden="true" className={open ? 'rotate-180' : ''} />
      </button>

      {open && (
        <div className="language-selector__menu" role="dialog" aria-label={t('language.label')}>
          <p className="language-selector__heading">{t('language.label')}</p>
          <label className="language-selector__search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">{t('language.search')}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' && filteredLocales.length) {
                  event.preventDefault()
                  focusOption(0)
                }
              }}
              placeholder={t('language.search')}
              autoFocus
            />
          </label>
          <div className="language-selector__list" role="listbox" aria-label={t('language.label')}>
            {filteredLocales.map((item, index) => {
              const active = item.code === locale
              return (
                <button
                  key={item.code}
                  ref={(element) => { optionRefs.current[index] = element }}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`language-selector__option ${active ? 'is-selected' : ''}`}
                  onKeyDown={(event) => handleOptionKeyDown(event, index, item)}
                  onClick={() => {
                    setLocale(item.code)
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                >
                  <img className="locale-flag" src={`/flags/${item.country}.svg`} alt="" aria-hidden="true" />
                  <span className="language-selector__copy">
                    <span className="language-selector__name">{item.name}</span>
                    <span className="language-selector__meta">{item.code}</span>
                  </span>
                  {active && <Check size={16} aria-label={t('language.selected')} />}
                </button>
              )
            })}
            {!filteredLocales.length && <p className="language-selector__empty">{t('language.noResults')}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export function RouteLanguageControl() {
  const { pathname } = useLocation()
  if (pathname === '/' || pathname.startsWith('/carnaval')) return null
  return (
    <div className="route-language-control">
      <LanguageSelector tone="light" />
    </div>
  )
}
