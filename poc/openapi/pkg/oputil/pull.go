package oputil

import (
	"github.com/thumbrise/op-universal-schema-go/schema"
)

func PullTermByID(termID string, terms []schema.Term) *schema.Term {
	for _, term := range terms {
		if term.ID == termID {
			return &term
		}
	}

	return nil
}
