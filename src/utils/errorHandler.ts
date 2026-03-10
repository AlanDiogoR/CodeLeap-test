import type { ApiError } from '../types/api'

export function formatErrorForUI(error: ApiError): string {
  const messages: Record<ApiError['code'], string> = {
    NETWORK_ERROR: 'Check your connection and try again.',
    TIMEOUT: 'The request took too long. Try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: error.message,
    UNAUTHORIZED: 'Unauthorized access.',
    NOT_FOUND: 'Resource not found.',
    UNKNOWN: error.message || 'An unexpected error occurred.',
  }
  return messages[error.code]
}
