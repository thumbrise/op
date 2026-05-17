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

package golang

import (
	schema "github.com/thumbrise/op/universal/schema/golang"
)

const BaseId = "github.com/thumbrise/op/universal/vendors/http"

type httpTerm struct {
	id      string
	comment string
	value   string
}

func (t httpTerm) ID() string      { return t.id }
func (t httpTerm) Comment() string { return t.comment }
func (t httpTerm) Term() schema.Term {
	return schema.Term{
		ID:      t.id,
		Comment: t.comment,
		Value:   t.value,
	}
}
