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
 */
export interface Instruction {
    version:    string;
    operations: Operation[];
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
 * Kind is required when of is set.
 */
export interface Term {
    id:        string;
    /** Human-readable note about the term. */
    comment?:  string;
    /** Whether this term must be present. */
    required?: boolean;
    kind?:     Kind;
    value?:    boolean | number | string;
    /** Requires kind. */
    of?:       Term[];
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
