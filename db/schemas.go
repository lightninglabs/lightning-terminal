package db

import (
	"embed"
	_ "embed"
)

//go:embed sqlc/migration*/*.*.sql
var SqlSchemas embed.FS
