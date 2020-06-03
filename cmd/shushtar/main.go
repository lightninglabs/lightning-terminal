package main

import (
	"fmt"
	"os"

	"github.com/jessevdk/go-flags"
	"github.com/lightninglabs/shushtar"
)

// main starts the shushtar application.
func main() {
	err := shushtar.New().Run()
	if e, ok := err.(*flags.Error); err != nil &&
		(!ok || e.Type != flags.ErrHelp) {

		_, _ = fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
