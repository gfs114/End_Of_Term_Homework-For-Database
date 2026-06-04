import axios from 'axios'
import { clearAuthSession, getAuthToken } from '@/utils/auth'

const http = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuthSession()
    }

    return Promise.reject(error)
  }
)

export default http
