package oputil

import (
	"encoding/json"
	"errors"
	"fmt"

	"gopkg.in/yaml.v2"

	"github.com/thumbrise/op-universal-schema-go/schema"
)

// Decoder supports multiformat:
// YAML, JSON
type Decoder struct{}

func NewDecoder() *Decoder {
	return &Decoder{}
}

func (d *Decoder) Decode(input []byte) (schema.Instruction, error) {
	var errs error

	ins := schema.Instruction{}

	err := yaml.Unmarshal(input, &ins)
	if err == nil {
		return ins, nil
	}

	errs = errors.Join(errs, err)

	ins = schema.Instruction{}

	err = json.Unmarshal(input, &ins)
	if err == nil {
		return ins, nil
	}

	errs = errors.Join(errs, err)

	return ins, fmt.Errorf("cannot unmarshal instruction: %w", errs)
}
