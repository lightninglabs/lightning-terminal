package main

import (
	"errors"
	"fmt"
	"os"

	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/lightning-terminal"
)

// main starts the lightning-terminal application.
func main() {
	err := terminal.New().Run()
	var flagErr *flags.Error
	if err != nil && errors.As(err, &flagErr) &&
		flagErr.Type != flags.ErrHelp {

		_, _ = fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
