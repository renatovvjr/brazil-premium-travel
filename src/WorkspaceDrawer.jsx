import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from './i18n'
import { workspaceDialogCopy } from './locales/workspaceDialogs'

const DrawerContext = createContext(null)

export function useWorkspaceDialogCopy() {
  const { locale, localeMeta } = useI18n()
  return workspaceDialogCopy[localeMeta.contentLocale || locale] || workspaceDialogCopy['en-AU']
}

export function useDrawerDraft(dirty) {
  const { drafts } = useContext(DrawerContext)
  const id = useId()
  useLayoutEffect(() => {
    if (!dirty) return
    drafts.add(id)
    return () => drafts.delete(id)
  }, [drafts, dirty, id])
}

export function useDrawerAction() {
  return useContext(DrawerContext).runAction
}

function ModalSurface({ children, className, labelledBy, describedBy, onDismiss, busy, role }) {
  const dialog = useRef(null)
  const backdropPressed = useRef(false)

  useLayoutEffect(() => {
    const element = dialog.current
    const opener = document.activeElement
    const parentDialog = element.parentElement?.closest('dialog')
    element.showModal()
    element.querySelector('[data-dialog-focus]')?.focus({ preventScroll: true })
    return () => {
      element.close()
      // A discard can unmount both dialogs in the same React commit.
      queueMicrotask(() => {
        if (element.open) return
        const restoreTarget = opener?.isConnected && !opener.closest('dialog:not([open])')
          ? opener
          : parentDialog?.querySelector('[data-dialog-focus]')
        restoreTarget?.focus({ preventScroll: true })
      })
    }
  }, [])

  function handleKeyDown(event) {
    if (event.key !== 'Tab' || event.target.closest('dialog') !== event.currentTarget) return
    const controls = [...event.currentTarget.querySelectorAll('button, input, select, textarea, a[href], [tabindex]')]
      .filter((control) => control.closest('dialog') === event.currentTarget &&
        control.tabIndex >= 0 && !control.matches(':disabled') && control.getClientRects().length)
    const first = controls[0]
    const last = controls.at(-1)
    if (!first || (event.shiftKey ? event.target === first : event.target === last)) {
      event.preventDefault()
      const wrappedTarget = event.shiftKey ? last : first
      wrappedTarget?.focus()
    }
  }

  return <dialog ref={dialog} role={role} aria-labelledby={labelledBy} aria-describedby={describedBy} aria-busy={busy || undefined}
    className={`fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden overscroll-none bg-transparent p-0 backdrop:bg-black/55 ${className}`}
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onDismiss() }}
    onKeyDown={handleKeyDown}
    onPointerDown={(event) => { backdropPressed.current = event.target === event.currentTarget }}
    onClick={(event) => {
      if (backdropPressed.current && event.target === event.currentTarget) onDismiss()
      backdropPressed.current = false
    }}>
    {children}
  </dialog>
}

const secondaryButton = 'inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-luxury-gold)]/60 px-5 py-2 text-center text-sm font-semibold text-[var(--color-deep-forest)] hover:bg-[#f7f5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-deep-forest)] disabled:opacity-50'
const closeButton = 'absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50'

export function DrawerActions({ children, className = '' }) {
  const { dismiss, busy } = useContext(DrawerContext)
  const copy = useWorkspaceDialogCopy()
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    {children}
    <button type="button" className={secondaryButton} onClick={dismiss} disabled={busy}>{copy.cancel}</button>
  </div>
}

export default function WorkspaceDrawer({ title, subtitle, close, children, modal = false }) {
  const copy = useWorkspaceDialogCopy()
  const headingId = useId()
  const confirmId = useId()
  const descriptionId = useId()
  const [drafts] = useState(() => new Set())
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function dismiss() {
    if (pending.current) return
    if (drafts.size) setConfirming(true)
    else close()
  }

  async function runAction(action) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    try {
      return await action()
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  const keepEditing = () => setConfirming(false)
  const panelClass = modal
    ? 'm-auto max-h-full w-full max-w-lg overflow-y-auto rounded-2xl'
    : 'ml-auto h-full w-[calc(100%-1rem)] max-w-xl overflow-y-auto'

  return <DrawerContext.Provider value={{ drafts, dismiss, runAction, busy }}>
    <ModalSurface labelledBy={headingId} onDismiss={dismiss} busy={busy} className={modal ? 'open:flex p-4' : ''}>
      <div className={`${panelClass} overscroll-contain bg-white text-[var(--color-deep-forest)] shadow-2xl`}>
        <header className="sticky top-0 z-10 bg-[var(--color-deep-forest)] p-5 pr-20 text-white sm:p-7 sm:pr-20">
          <p className="eyebrow text-[#f1d991]">{copy.workspaceRecord}</p>
          <h2 id={headingId} className="mt-2 break-words text-2xl font-semibold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
          <button type="button" data-dialog-focus aria-label={copy.close} title={copy.close} onClick={dismiss} disabled={busy}
            className={`${closeButton} border-[#f1d991]/60 text-[#f1d991] hover:bg-white/10 focus-visible:outline-[#f1d991]`}>
            <X size={23} aria-hidden="true"/>
          </button>
        </header>
        <fieldset disabled={busy} className="min-w-0 p-5 sm:p-7">{children}</fieldset>
      </div>
      {confirming && <ModalSurface role="alertdialog" labelledBy={confirmId} describedBy={descriptionId} onDismiss={keepEditing} className="open:flex p-4">
        <div className="relative m-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--color-luxury-gold)]/40 bg-white p-5 text-[var(--color-deep-forest)] shadow-2xl sm:p-7">
          <h2 id={confirmId} className="min-h-9 pr-14 text-xl font-semibold">{copy.unsavedTitle}</h2>
          <button type="button" aria-label={copy.close} title={copy.close} onClick={keepEditing}
            className={`${closeButton} border-[var(--color-luxury-gold)]/60 hover:bg-[#f7f5ef] focus-visible:outline-[var(--color-deep-forest)]`}>
            <X size={23} aria-hidden="true"/>
          </button>
          <p id={descriptionId} className="mt-2 text-sm text-zinc-600">{copy.unsavedDescription}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" data-dialog-focus className={secondaryButton} onClick={keepEditing}>{copy.keepEditing}</button>
            <button type="button" className="gold-button justify-center text-center" onClick={close}>{copy.discard}</button>
          </div>
        </div>
      </ModalSurface>}
    </ModalSurface>
  </DrawerContext.Provider>
}
