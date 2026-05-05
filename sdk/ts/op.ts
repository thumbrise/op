/*
 * Copyright 2026 thumbrise
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Operation Protocol Instruction
 * A program is an instruction — an identifiable container that holds
 * one or more operations and optional top-level traits.
 * The id makes the program addressable. Without it, the program cannot
 * be invoked, discovered, or distinguished.
 */
export interface Instruction {
    /** Instruction format version. Required. Allows receivers to detect breaking changes. */
    version:    string;
    /** Machine-readable identifier. Required (from Nota). Makes the program addressable. */
    id:         string;
    /** Human-readable comment about the instruction. Required (from Nota). */
    comment:    string;
    /** The list of operations described by this instruction. */
    operations: Operation[];
    /**
     * Top-level traits — opinions about the whole program.
     * SEO metadata, licensing, code generation preferences, anything
     * that is not a fact about operations but an opinion about the container.
     */
    trait:      Term[];
}

export interface Operation {
    /**
     * Machine-readable operation identifier. For example, full function name.
     */
    id:      string;
    /**
     * Human-readable comment about the operation.
     */
    comment: string;
    input:   Term[];
    output:  Term[];
    error:   Term[];
    /**
     * The trait rail. Opinions attached from outside. Same Term structure as input, output, and error.
     */
    trait:   Term[];
}

/**
 * The atom of a rail.
 * A unit of meaning. From formal logic — an atomic proposition.
 * 'This thing has a name and a type.' Not tied to any language's concept
 * of field, property, parameter, or argument.
 */
export interface Term {
    /** Machine-readable identifier. Required. */
    id:         string;
    /** Human-readable note about the term. Required (from Nota). */
    comment:    string;
    /** Whether this term must be present. */
    required?:  boolean;
    /** What kind of data this term represents. Nine kinds. */
    kind?:      Kind;
    /** Optional concrete value. Useful for enums, defaults, and constants. */
    value?:      boolean | number | string;
    /**
     * What this term consists of.
     * - object + of = composition
     * - array + of = repetition
     * - enum + of = choice
     * Requires kind to be set.
     */
    of?:        Term[];
}

export enum Kind {
    Array = "array",
    Binary = "binary",
    Boolean = "boolean",
    Datetime = "datetime",
    Enum = "enum",
    Float = "float",
    Integer = "integer",
    Object = "object",
    String = "string",
}
