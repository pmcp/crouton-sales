export interface HelperSession {
  token: string
  helperName: string
  eventId: string
  teamId: string
  expiresAt: string
}

export const useHelperAuth = () => {
  const helperSession = useState<HelperSession | null>('helper-session', () => null)

  // Load session from localStorage on client side
  const loadSession = () => {
    if (!import.meta.client) return null

    const stored = localStorage.getItem('pos-helper-info')
    if (!stored) return null

    try {
      const session = JSON.parse(stored) as HelperSession

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        clearSession()
        return null
      }

      helperSession.value = session
      return session
    }
    catch {
      clearSession()
      return null
    }
  }

  // Check if helper is authenticated
  const isHelper = computed(() => {
    if (!helperSession.value) {
      loadSession()
    }
    return !!helperSession.value
  })

  // Get helper name
  const helperName = computed(() => helperSession.value?.helperName || '')

  // Get helper event ID
  const eventId = computed(() => helperSession.value?.eventId || '')

  // Get helper team ID
  const teamId = computed(() => helperSession.value?.teamId || '')

  // Get helper token
  const token = computed(() => helperSession.value?.token || '')

  // Validate token with server (optional - can be used for token refresh)
  const validateToken = async (): Promise<boolean> => {
    const session = helperSession.value || loadSession()
    if (!session) return false

    // Check local expiration first
    if (new Date(session.expiresAt) < new Date()) {
      clearSession()
      return false
    }

    return true
  }

  // Clear the session
  const clearSession = () => {
    helperSession.value = null
    if (import.meta.client) {
      localStorage.removeItem('pos-helper-info')
      const helperToken = useCookie('pos-helper-token')
      helperToken.value = null
    }
  }

  // Set session (used after login)
  const setSession = (session: HelperSession) => {
    helperSession.value = session
    if (import.meta.client) {
      localStorage.setItem('pos-helper-info', JSON.stringify(session))
    }
  }

  // Logout helper
  const logout = async () => {
    clearSession()
  }

  // Initialize on mount
  if (import.meta.client) {
    loadSession()
  }

  return {
    isHelper,
    helperName,
    eventId,
    teamId,
    token,
    helperSession: readonly(helperSession),
    validateToken,
    setSession,
    logout,
    loadSession,
  }
}
