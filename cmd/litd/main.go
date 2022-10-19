package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/jessevdk/go-flags"
	terminal "github.com/lightninglabs/lightning-terminal"
)

// main starts the lightning-terminal application.
func main() {
	err := terminal.New().Run()
	var flagErr *flags.Error
	isFlagErr := errors.As(err, &flagErr)
	if err != nil && (!isFlagErr || flagErr.Type != flags.ErrHelp) {
		_, _ = fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
