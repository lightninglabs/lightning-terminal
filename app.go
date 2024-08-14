//go:build !litd_no_ui
// +build !litd_no_ui

package terminal

import (
	"embed"
)

var (
	// appBuildFS is an in-memory file system that contains all the static
	// HTML/CSS/JS files of the UI. It is compiled into the binary with the
	// go 1.16 embed directive below. Because the path is relative to the
	// root package, all assets will have a path prefix of /app/build/ which
	// we'll strip by giving a sub directory to the HTTP server.
	//
	//go:embed app/build/*
	appBuildFS embed.FS
)
