import type { ApiError } from '../types/api'

export function formatErrorForUI(error: ApiError): string {
  const messages: Record<ApiError['code'], string> = {
    NETWORK_ERROR: 'Verifique sua conexão e tente novamente.',
    TIMEOUT: 'A requisição demorou muito. Tente novamente.',
    SERVER_ERROR: 'Erro no servidor. Tente mais tarde.',
    VALIDATION_ERROR: error.message,
    UNAUTHORIZED: 'Acesso não autorizado.',
    NOT_FOUND: 'Recurso não encontrado.',
    UNKNOWN: error.message || 'Ocorreu um erro inesperado.',
  }
  return messages[error.code]
}
