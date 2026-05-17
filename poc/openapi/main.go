package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/thumbrise/op/poc/openapi/cmd"
)

func main() {
	ctx := context.Background()

	setLogger()

	if err := cmd.Root.Run(ctx, os.Args); err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "error: %[1]v\n", err)

		os.Exit(1)
	}
}

func setLogger() {
	handler := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{
		AddSource: true,
		Level:     nil,
	})

	logger := slog.New(handler)

	slog.SetDefault(logger)
}
