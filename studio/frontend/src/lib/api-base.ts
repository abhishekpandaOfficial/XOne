function configuredWebApiBase(): string {
  const candidate = String(import.meta.env.VITE_XONE_API_BASE ?? '').trim()
  if (!candidate) return ''
  if (!/^https?:\/\//i.test(candidate)) {
    console.warn('Ignoring VITE_XONE_API_BASE because it is not an HTTP(S) URL.')
    return ''
  }
  return candidate.replace(/\/+$/, '')
}

let apiBase = configuredWebApiBase()

function detectTauri(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return (
    '__TAURI__' in window ||
    '__TAURI_INTERNALS__' in window ||
    window.location.protocol === 'tauri:'
  )
}

const isTauri = detectTauri()

if (isTauri) {
  // never connects; real port arrives via server-port
  apiBase = 'http://127.0.0.1:0'
}

const initialApiBase = apiBase

export function resetApiBase() {
  apiBase = initialApiBase
}

export function setApiBase(port: number) {
  apiBase = `http://127.0.0.1:${port}`
}

export function getApiBase(): string {
  return apiBase
}

export function apiUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${apiBase}${path}`
}

export { isTauri }
