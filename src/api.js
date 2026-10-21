import axios from 'axios'
import { API_URL } from './consts'

/**
 * Shared axios instance for every API call.
 * The token is read from localStorage on each request, so logging out takes
 * effect immediately (no stale Authorization header left on axios defaults).
 */
const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// An expired or invalid session: clear it so the UI shows the user as logged out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
    }
    return Promise.reject(error)
  }
)

export default api
