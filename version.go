package terminal

// Copyright (c) 2013-2017 The btcsuite developers
// Copyright (c) 2015-2016 The Decred developers
// Heavily inspired by https://github.com/btcsuite/btcd/blob/master/version.go
// Copyright (C) 2015-2022 The Lightning Network Developers

import (
	"bytes"
	"fmt"
	"strings"
)

// Commit stores the current git tag of this build, when the build is based on
// a tagged commit. If the build is based on an untagged commit or is a dirty
// build, the Commit field stores the most recent tag suffixed by the commit
// hash, and/or "-dirty". This should be set using the -ldflags during
// compilation.
var Commit string

// GitCommitHash stores the current git commit hash of this build. This should
// be set using the -ldflags during compilation.
var GitCommitHash string

// semanticAlphabet
const semanticAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-."

// These constants define the application version and follow the semantic
// versioning 2.0.0 spec (http://semver.org/).
const (
	appMajor uint = 0
	appMinor uint = 14
	appPatch uint = 1

	// appPreRelease MUST only contain characters from semanticAlphabet per
	// the semantic versioning spec.
	appPreRelease = "alpha"
)

// Version returns the application version as a properly formed string per the
// semantic versioning 2.0.0 spec (http://semver.org/).
func Version() string {
	return semanticVersion()
}

// RichVersion returns the application version as a properly formed string
// per the semantic versioning 2.0.0 spec (http://semver.org/), the git tag and
// commit hash it was built on.
func RichVersion() string {
	// Append git tag and commit hash of current build to version.
	return fmt.Sprintf(
		"%s tag=%s commit=%s", semanticVersion(), Commit, GitCommitHash,
	)
}

// CommitHash returns the git commit hash of the current build.
func CommitHash() string {
	return GitCommitHash
}

// CommitTag returns the git tag of the current build.
func CommitTag() string {
	return Commit
}

// semanticVersion returns the SemVer part of the version.
func semanticVersion() string {
	// Start with the major, minor, and patch versions.
	version := fmt.Sprintf("%d.%d.%d", appMajor, appMinor, appPatch)

	// Append pre-release version if there is one.  The hyphen called for
	// by the semantic versioning spec is automatically appended and should
	// not be contained in the pre-release string.  The pre-release version
	// is not appended if it contains invalid characters.
	preRelease := normalizeVerString(appPreRelease)
	if preRelease != "" {
		version = fmt.Sprintf("%s-%s", version, preRelease)
	}

	return version
}

// normalizeVerString returns the passed string stripped of all characters
// which are not valid according to the semantic versioning guidelines for
// pre-release version and build metadata strings.  In particular they MUST
// only contain characters in semanticAlphabet.
func normalizeVerString(str string) string {
	var result bytes.Buffer
	for _, r := range str {
		if strings.ContainsRune(semanticAlphabet, r) {
			result.WriteRune(r)
		}
	}
	return result.String()
}
