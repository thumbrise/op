/**
 * JSON Format Codec — bidirectional conversion.
 * Декодирует: JSON string → Instruction
 * Кодирует: Instruction → JSON string
 */

import type { Instruction } from '@op-sdk'
import { validateJson, domainError, type PlaygroundError } from '../../../components/playground/jsonValidation'
import {
  type FormatError,
  type FormatErrorCode,
  type DecodeResultType,
  type EncodeResultType
} from '../errors'

/**
 * Map PlaygroundError → FormatError (universal format).
 */
function mapError(error: PlaygroundError): FormatError {
  const code: FormatErrorCode = mapKindToCode(error.kind, error.message)

  return {
    code,
    path: error.path || '/',
    message: error.message,
    original: error  // сохраняем оригинал для отладки
  }
}

/**
 * Map PlaygroundError kind → FormatErrorCode.
 */
function mapKindToCode(kind: string, message: string): FormatErrorCode {
  if (kind === 'syntax') return 'PARSE_ERROR'

  if (kind === 'domain') {
    if (message.includes('at least one operation')) return 'MIN_LENGTH'
    return 'PARSE_ERROR'  // fallback
  }

  if (kind === 'schema') {
    // Ajv keywords → universal codes
    // These come from the original Ajv error, stored in error.path
    const path = kind
    if (message.includes('required')) return 'REQUIRED'
    if (message.includes('type')) return 'TYPE_MISMATCH'
    if (message.includes('enum')) return 'INVALID_ENUM'
    if (message.includes('pattern')) return 'PATTERN_FAILED'
    if (message.includes('additionalProperties')) return 'UNKNOWN_FIELD'
    if (message.includes('minimum')) return 'MIN_LENGTH'
    if (message.includes('maximum')) return 'MAX_LENGTH'

    return 'TYPE_MISMATCH'  // default
  }

  return 'PARSE_ERROR'
}

/**
 * Decode: unknown (JSON string) → Instruction.
 * Input: value — JSON string (текущий формат Playground)
 */
export function decode(value: unknown): DecodeResultType<Instruction> {
  if (typeof value !== 'string') {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        path: '/',
        message: `Expected string, got ${typeof value}`,
        original: { expected: 'string', got: typeof value }
      }
    }
  }

  const { value: parsed, errors } = validateJson(value)

  if (errors.length > 0) {
    return {
      success: false,
      error: mapError(errors[0])  // возвращаем первую ошибку
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        path: '/',
        message: 'Invalid instruction format',
        original: parsed
      }
    }
  }

  return {
    success: true,
    value: parsed as Instruction
  }
}

/**
 * Encode: Instruction → JSON string.
 */
export function encode(instruction: Instruction): EncodeResultType<string> {
  try {
    const json = JSON.stringify(instruction, null, 2)
    return {
      success: true,
      value: json
    }
  } catch (e) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        path: '/',
        message: `Failed to stringify: ${e}`,
        original: e
      }
    }
  }
}

/**
 * JSON Codec — implements bidirectional conversion.
 */
export const jsonCodec = {
  decode,
  encode
}