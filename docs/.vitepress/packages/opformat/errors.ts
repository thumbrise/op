/**
 * opformat errors — универсальные коды ошибок форматов.
 * Не знает про конкретный формат (JSON, Protobuf...), только про форму.
 */

export type FormatErrorCode =
  | 'PARSE_ERROR'
  | 'REQUIRED'
  | 'TYPE_MISMATCH'
  | 'INVALID_ENUM'
  | 'MIN_LENGTH'
  | 'MAX_LENGTH'
  | 'PATTERN_FAILED'
  | 'UNKNOWN_FIELD'

/**
 * JSON Pointer — универсальный путь.
 * Пример: "/operations/0/id"
 */
export type JsonPointer = string

/**
 * Ошибка формата.
 * original — опционально хранит оригинальную ошибку от валидатора.
 */
export interface FormatError {
  code: FormatErrorCode
  path: JsonPointer
  message: string
  original?: unknown
}

/**
 * Результат декодирования.
 */
export interface DecodeResult<T> {
  success: true
  value: T
  error?: never
}

export interface DecodeFailure {
  success: false
  value?: never
  error: FormatError
}

export type DecodeResultType<T> = DecodeResult<T> | DecodeFailure

/**
 * Результат кодирования.
 */
export interface EncodeResult<T> {
  success: true
  value: T
  error?: never
}

export interface EncodeFailure {
  success: false
  value?: never
  error: FormatError
}

export type EncodeResultType<T> = EncodeResult<T> | EncodeFailure