export type CapturePanelMode = 'expanded' | 'collapsed' | 'hidden'

const EVENT_NAME = 'capture-panel-mode-changed'

export function emitCapturePanelModeChange(mode: CapturePanelMode) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<CapturePanelMode>(EVENT_NAME, { detail: mode }))
}

export function subscribeToCapturePanelModeChange(callback: (mode: CapturePanelMode) => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: Event) => {
    const custom = event as CustomEvent<CapturePanelMode>
    if (custom.detail) {
      callback(custom.detail)
    }
  }

  window.addEventListener(EVENT_NAME, handler as EventListener)
  return () => window.removeEventListener(EVENT_NAME, handler as EventListener)
}
