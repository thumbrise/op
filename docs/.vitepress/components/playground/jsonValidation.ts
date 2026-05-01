// Shared JSON validation model for the Playground JSON editor.
// Errors are first-class objects with source locations — never flattened to strings.
//
// Three sources, one shape:
//   1. syntax  — from jsonc-parser (JSON.parse would throw, we want all errors)
//   2. schema  — from Ajv ErrorObject[], enriched with source locations via the AST
//   3. domain  — app-level invariants (e.g. "at least one operation")

import type {ErrorObject} from 'ajv'
import Ajv2020 from 'ajv/dist/2020'
import {
    findNodeAtLocation,
    parseTree,
    printParseErrorCode,
    type Node,
    type ParseError,
} from 'jsonc-parser'

// Master copy lives in docs/reference/ and is copied into /public at build
// time by vite-plugin-static-copy (see vite config). That keeps the public URL
// (`$id`) valid for external tools while the TS bundle imports directly.
import schema from '../../../reference/instruction.v1.json'

export type ErrorKind = 'syntax' | 'schema' | 'domain'

export interface SourceRange {
    /** 1-based line number where the error starts. */
    line: number
    /** 1-based column. */
    column: number
    /** Character offset from the start of the text. */
    offset: number
    /** Length of the highlighted span, in characters. */
    length: number
}

export interface PlaygroundError {
    kind: ErrorKind
    message: string
    /** JSON Pointer for schema errors, empty for syntax/domain. */
    path: string
    /** Source location, if known. Domain errors usually have none. */
    range?: SourceRange
}

const ajv = new Ajv2020({allErrors: true, strict: false})
const validateInstruction = ajv.compile(schema)

/**
 * Run the full pipeline: parse → validate → collect errors.
 * Returns the parsed value (may be partially-formed even with errors)
 * and the flat error list.
 */
export function validateJson(text: string): {value: unknown; errors: PlaygroundError[]} {
    const errors: PlaygroundError[] = []
    const parseErrors: ParseError[] = []
    const root = parseTree(text, parseErrors, {allowTrailingComma: false})

    for (const e of parseErrors) {
        errors.push({
            kind: 'syntax',
            message: printParseErrorCode(e.error),
            path: '',
            range: rangeFromOffset(text, e.offset, e.length),
        })
    }

    if (!root) {
        return {value: undefined, errors}
    }

    const value = nodeToValue(root)

    // Only validate against the schema if the JSON parsed into something.
    if (!validateInstruction(value) && validateInstruction.errors) {
        for (const err of validateInstruction.errors) {
            errors.push(schemaErrorToPlayground(err, root, text))
        }
    }

    return {value, errors}
}

/** Convert a raw Ajv error into a PlaygroundError with source locations. */
function schemaErrorToPlayground(err: ErrorObject, root: Node, text: string): PlaygroundError {
    const segments = instancePathToSegments(err.instancePath)
    const node = segments.length === 0 ? root : findNodeAtLocation(root, segments)
    const range = node ? rangeFromOffset(text, node.offset, node.length) : undefined

    return {
        kind: 'schema',
        message: humanizeSchemaError(err),
        path: err.instancePath || '/',
        range,
    }
}

/** Domain-level errors — no source location, no schema path. */
export function domainError(message: string): PlaygroundError {
    return {kind: 'domain', message, path: ''}
}

// ── Helpers ────────────────────────────────────────────────────────────────

function rangeFromOffset(text: string, offset: number, length: number): SourceRange {
    // Count newlines up to the offset to find line/column. O(offset), fine for
    // the sizes we expect in the Playground.
    let line = 1
    let column = 1
    for (let i = 0; i < offset && i < text.length; i++) {
        if (text.charCodeAt(i) === 10 /* \n */) {
            line++
            column = 1
        } else {
            column++
        }
    }
    return {line, column, offset, length}
}

function instancePathToSegments(instancePath: string): Array<string | number> {
    if (!instancePath) return []
    // JSON Pointer: "/operations/0/input/3/kind" → ["operations", 0, "input", 3, "kind"]
    return instancePath
        .split('/')
        .slice(1)
        .map((raw) => {
            const unescaped = raw.replace(/~1/g, '/').replace(/~0/g, '~')
            const asNumber = Number(unescaped)
            return Number.isInteger(asNumber) && String(asNumber) === unescaped ? asNumber : unescaped
        })
}

function humanizeSchemaError(err: ErrorObject): string {
    // Ajv messages are already decent. We just prepend the offending property
    // for `required` / `additionalProperties` where the message alone is vague.
    switch (err.keyword) {
        case 'required':
            return `missing required property "${(err.params as {missingProperty?: string}).missingProperty || '?'}"`
        case 'additionalProperties':
            return `unexpected property "${(err.params as {additionalProperty?: string}).additionalProperty || '?'}"`
        case 'enum': {
            const allowed = (err.params as {allowedValues?: unknown[]}).allowedValues
            return allowed ? `must be one of: ${allowed.join(', ')}` : err.message || 'enum violation'
        }
        default:
            return err.message || err.keyword
    }
}

/**
 * jsonc-parser's Node tree → plain JS value.
 * Equivalent to JSON.parse but works off the already-built AST (no double parse).
 */
function nodeToValue(node: Node): unknown {
    switch (node.type) {
        case 'object': {
            const obj: Record<string, unknown> = {}
            for (const child of node.children ?? []) {
                if (child.type !== 'property' || !child.children || child.children.length < 2) continue
                const key = child.children[0].value as string
                obj[key] = nodeToValue(child.children[1])
            }
            return obj
        }
        case 'array':
            return (node.children ?? []).map(nodeToValue)
        case 'null':
            return null
        default:
            return node.value
    }
}
