package sqlc

// BackendType is an enum that represents the type of database backend we're
// using.
type BackendType uint8

const (
	// BackendTypeUnknown indicates we're using an unknown backend.
	BackendTypeUnknown BackendType = iota

	// BackendTypeSqlite indicates we're using a SQLite backend.
	BackendTypeSqlite

	// BackendTypePostgres indicates we're using a Postgres backend.
	BackendTypePostgres
)

// wrappedTX is a wrapper around a DBTX that also stores the database backend
// type.
type wrappedTX struct {
	DBTX

	backendType BackendType
}

// Backend returns the type of database backend we're using.
func (q *Queries) Backend() BackendType {
	wtx, ok := q.db.(*wrappedTX)
	if !ok {
		// Shouldn't happen unless a new database backend type is added
		// but not initialized correctly.
		return BackendTypeUnknown
	}

	return wtx.backendType
}

// NewSqlite creates a new Queries instance for a SQLite database.
func NewSqlite(db DBTX) *Queries {
	return &Queries{db: &wrappedTX{db, BackendTypeSqlite}}
}

// NewPostgres creates a new Queries instance for a Postgres database.
func NewPostgres(db DBTX) *Queries {
	return &Queries{db: &wrappedTX{db, BackendTypePostgres}}
}
