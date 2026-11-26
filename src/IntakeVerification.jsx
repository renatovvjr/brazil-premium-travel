import { useEffect, useRef } from 'react'
import { isWorkspaceV2IntakeEnabled } from './lib/intakeClient'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
let turnstileScript

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!turnstileScript) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    turnstileScript = new Promise((resolve, reject) => {
      script.onload = () => resolve(window.turnstile)
      script.onerror = () => {
        turnstileScript = undefined
        script.remove()
        reject(new Error('Human verification could not load.'))
      }
    })
    document.head.append(script)
  }
  return turnstileScript
}

export default function IntakeVerification() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let widgetId
    let active = true
    loadTurnstile().then((turnstile) => {
      if (!active) return
      widgetId = turnstile.render(container, { sitekey: siteKey, action: 'enquiry', size: 'flexible', language: 'auto' })
      container.dataset.intakeWidget = widgetId
    }).catch(() => {})
    return () => {
      active = false
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [])

  return isWorkspaceV2IntakeEnabled() && siteKey ? <div ref={containerRef} className="my-4" /> : null
}
