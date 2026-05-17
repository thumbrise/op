package compile

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	nethttp "net/http"
	"os"

	"github.com/swaggest/openapi-go/openapi3"

	"github.com/thumbrise/op-universal-schema-go/schema"
	ophttp "github.com/thumbrise/op-universal-vendor-http-go/trait"
	"github.com/thumbrise/op/poc/openapi/pkg/oputil"
)

type Compiler struct{}

func (c *Compiler) Compile(ctx context.Context, input []byte, outputPath string) error {
	dec := oputil.NewDecoder()

	instruction, err := dec.Decode(input)
	if err != nil {
		return err
	}

	openapiInstruction, err := c.instructionToOpenapi(ctx, instruction)
	if err != nil {
		return err
	}

	fmt.Printf("\n%v\n", string(openapiInstruction))

	return os.WriteFile(outputPath, openapiInstruction, 0o600)
}

func (c *Compiler) instructionToOpenapi(ctx context.Context, instruction schema.Instruction) ([]byte, error) {
	oa3Spec := &openapi3.Spec{Openapi: "3.0.3"}
	oa3Spec.Info.
		WithTitle(instruction.ID).
		WithVersion(instruction.Version).
		WithDescription(instruction.Comment)

	var errs error

	for _, operation := range instruction.Operations {
		err := c.operationToOpenapi(ctx, oa3Spec, operation)
		if err != nil {
			errs = errors.Join(errs, err)
		}
	}

	if errs != nil {
		return nil, errs
	}

	return oa3Spec.MarshalYAML()
}

func (c *Compiler) operationToOpenapi(_ context.Context, oa3Spec *openapi3.Spec, opOperation schema.Operation) error {
	oa3Operation := openapi3.Operation{}

	oa3Path := c.pullHTTPPath(opOperation)
	if oa3Path == "" {
		slog.Info("No github.com/thumbrise/op/universal/ophttp/path found. Skipping...",
			slog.String("opid", opOperation.ID),
		)

		return nil
	}

	responses := make(map[string]openapi3.ResponseOrRef)

	for _, term := range opOperation.Error {
		httpStatusTerm := oputil.PullTermByID(ophttp.StatusID, term.Trait)
		if httpStatusTerm == nil {
			slog.Info("No github.com/thumbrise/op/universal/ophttp/status found",
				slog.String("opid", opOperation.ID),
				slog.Any("error", term),
			)

			continue
		}

		key := fmt.Sprintf("%s", httpStatusTerm.Value)

		resp := openapi3.ResponseOrRef{
			Response: &openapi3.Response{
				Description:   term.Comment,
				Headers:       nil,
				Content:       nil,
				Links:         nil,
				MapOfAnything: nil,
			},
		}

		responses[key] = resp
	}

	oa3Operation.Responses.WithMapOfResponseOrRefValues(responses)

	err := oa3Spec.AddOperation(nethttp.MethodGet, oa3Path, oa3Operation)
	if err != nil {
		return fmt.Errorf("oa3Spec.AddOperation: %w: operation=%+v", err, opOperation)
	}

	return nil
}

func (c *Compiler) pullHTTPPath(operation schema.Operation) string {
	httpPathTerm := oputil.PullTermByID(ophttp.PathID, operation.Trait)
	result := ""

	if httpPathTerm == nil {
		return result
	}

	return fmt.Sprintf("%s", httpPathTerm.Value)
}
