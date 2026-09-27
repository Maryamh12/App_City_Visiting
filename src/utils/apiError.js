/**
 * Interprets an Axios error and returns a friendly user-facing message.
 * Detects auth errors so the UI can prompt the user to log in.
 */
export const parseApiError = (err) => {
  const status  = err.response?.status
  const message = err.response?.data?.message ?? ''
  const lower   = message.toLowerCase()

  // No token / bad token / expired → prompt login
  if (
    status === 401 ||
    status === 403 ||
    lower.includes('token') ||
    lower.includes('log in') ||
    lower.includes('login') ||
    lower.includes('authorized')
  ) {
    return { message: 'You need to be logged in to do this.', needsLogin: true }
  }

  // Network / server unreachable
  if (!err.response) {
    return { message: 'Cannot reach the server. Is the API running?', needsLogin: false }
  }

  return { message: message || 'Something went wrong. Please try again.', needsLogin: false }
}
