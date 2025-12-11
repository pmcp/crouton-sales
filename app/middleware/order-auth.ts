export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  const team = to.params.team as string
  const event = to.params.event as string

  // Option 1: User is logged in - allow access
  // (they're either a team member or will see an error from the page itself)
  if (loggedIn.value) {
    return
  }

  // Option 2: Check for valid helper token in cookie
  const helperToken = useCookie('pos-helper-token')
  if (helperToken.value) {
    // Token exists - the order page will validate it and load session
    // If invalid, the page will handle showing login
    return
  }

  // No auth - redirect to login
  return navigateTo(`/order/${team}/${event}/login`)
})
