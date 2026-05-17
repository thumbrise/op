package stdin

import (
	"errors"
	"fmt"
	"io"
	"os"
)

var (
	ErrStdinTerminalNotSupported = errors.New("stdin terminal not supported")
	ErrStdinStat                 = errors.New("unable to stat stdin")
)

func Read() ([]byte, error) {
	fi, err := os.Stdin.Stat()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrStdinStat, err)
	}

	if fi.Mode()&os.ModeCharDevice != 0 {
		return nil, ErrStdinTerminalNotSupported
	}

	return io.ReadAll(os.Stdin)
}
