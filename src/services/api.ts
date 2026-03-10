import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types/api'

const BASE_URL = 'https://dev.codeleap.co.uk/careers/'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ [key: string]: unknown }>
    const status = axiosError.response?.status
    const message =
      (axiosError.response?.data as { message?: string })?.message ??
      axiosError.message ??
      'Erro desconhecido'

    if (axiosError.code === 'ERR_NETWORK')
      return { code: 'NETWORK_ERROR', message: 'Verifique sua conexão' }
    if (axiosError.code === 'ECONNABORTED')
      return { code: 'TIMEOUT', message: 'A requisição expirou' }
    if (status === 401) return { code: 'UNAUTHORIZED', message, status }
    if (status === 404) return { code: 'NOT_FOUND', message, status }
    if (status && status >= 400 && status < 500)
      return { code: 'VALIDATION_ERROR', message, status }
    if (status && status >= 500)
      return { code: 'SERVER_ERROR', message: 'Erro no servidor', status }

    return { code: 'UNKNOWN', message, status }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Erro desconhecido',
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = normalizeError(error)
    return Promise.reject(apiError)
  }
)
