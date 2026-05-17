package cmd

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/urfave/cli/v3"

	"github.com/thumbrise/op/poc/openapi/internal/compile"
	"github.com/thumbrise/op/poc/openapi/pkg/stdin"
)

var (
	ErrStdinTerminal    = errors.New("stdin is a terminal; pipe the instruction or use --input flag")
	ErrNoFile           = errors.New("instruction file does not exist")
	ErrNoInstruction    = errors.New("no instruction provided")
	ErrConflictingInput = errors.New("flags --input and --input-stdin are mutually exclusive")
)
var ErrStdinRead = errors.New("stdin read error")

var (
	// instruction path
	instruction string
	// use instruction as stdin
	instructionStdin bool
	// output path
	output string
)

var Root = cli.Command{
	Name:      "op-to-openapi",
	Usage:     "Compiles openapi from OP instruction. Expects github.com/thumbrise/op/universal/http traits. Ignores unknown traits.",
	Version:   "1.0.0",
	UsageText: "op-to-openapi [--input <FILE>|--input-stdin] [--output <FILE>]",
	Description: `Compiles openapi from OP instruction.
OP instruction reference https://thumbrise.github.io/op/reference/instruction.v1.json 
Expects github.com/thumbrise/op/universal/http traits. Ignores unknown traits.

Examples:
	# Get instruction via http, pass to compiler via stdin and --input-stdin flag
	curl https://myprogram.com/instruction | op-to-openapi --input-stdin --output ./output/openapi.yaml

	# Specify instruction file, pass to compiler via --input flag
	op-to-openapi --input ./myinstruction.json --output ./output/openapi.yaml
`,

	Suggest: true,
	Flags: []cli.Flag{
		&cli.StringFlag{
			Name:        "input",
			Aliases:     []string{"i"},
			Usage:       "instruction file path to compile",
			Required:    false,
			Destination: &instruction,
		},
		&cli.BoolFlag{
			Name:        "input-stdin",
			Usage:       "use stdin for instruction",
			Required:    false,
			Destination: &instructionStdin,
		},
		&cli.StringFlag{
			Name:        "output",
			Aliases:     []string{"o"},
			Usage:       "compiled output path",
			Required:    true,
			Destination: &output,
		},
	},

	Action: func(ctx context.Context, command *cli.Command) error {
		var input []byte

		if instructionStdin && instruction != "" {
			return ErrConflictingInput
		}

		if instructionStdin {
			var err error

			input, err = stdin.Read()
			if err != nil {
				if errors.Is(err, stdin.ErrStdinTerminalNotSupported) {
					return fmt.Errorf("%w: %w", ErrStdinTerminal, err)
				}

				return fmt.Errorf("%w: %w", ErrStdinRead, err)
			}
		} else if instruction != "" {
			if _, err := os.Stat(instruction); err != nil && os.IsNotExist(err) {
				return fmt.Errorf("%w: %s", ErrNoFile, instruction)
			}

			var err error
			//nolint:gosec // User input
			input, err = os.ReadFile(instruction)
			if err != nil {
				return fmt.Errorf("instruction read error: %w", err)
			}
		} else {
			return ErrNoInstruction
		}

		fmt.Printf("instruction: %v\ninstructionStdin: %v\noutput: %v\n", instruction, instructionStdin, output)

		compiler := &compile.Compiler{}

		return compiler.Compile(ctx, input, output)
	},
}
