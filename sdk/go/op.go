// Copyright 2026 thumbrise
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package op

type Instruction struct {
	Version    string      `json:"version"`
	Operations []Operation `json:"operations"`
}
type Operation struct {
	ID      string         `json:"id"`
	Comment string         `json:"comment"`
	Input   []Term         `json:"input"`
	Output  []Term         `json:"output"`
	Errors  []Term         `json:"errors"`
	Traits  map[string]any `json:"traits,omitempty"`
}
// Term represents a single term in a rail.
// Kind is required when Value or Of is set.
type Term struct {
	ID    string `json:"id"`
	Kind  Kind   `json:"kind,omitempty"`
	Value any    `json:"value,omitempty"` // requires Kind; string | int | float64 | bool only
	Of    []Term `json:"of,omitempty"`    // requires Kind
}

type Kind string

const (
	KindString   Kind = "string"
	KindInteger  Kind = "integer"
	KindFloat    Kind = "float"
	KindBoolean  Kind = "boolean"
	KindBinary   Kind = "binary"
	KindDatetime Kind = "datetime"
	KindArray    Kind = "array"
	KindObject   Kind = "object"
	KindEnum     Kind = "enum"
)
