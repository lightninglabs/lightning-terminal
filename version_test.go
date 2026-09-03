package terminal

import (
	"testing"

	"github.com/stretchr/testify/require"
)

// TestNormalizeVerString ensures that normalizeVerString keeps only the
// characters that are valid according to the semantic versioning guidelines
// (those contained in semanticAlphabet) and strips everything else.
func TestNormalizeVerString(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		input    string
		expected string
	}{{
		name:     "empty string",
		input:    "",
		expected: "",
	}, {
		name:     "already valid alphanumeric",
		input:    "alpha1",
		expected: "alpha1",
	}, {
		name:     "valid with hyphen and dot",
		input:    "beta-rc.2",
		expected: "beta-rc.2",
	}, {
		name:     "spaces are stripped",
		input:    "hello world",
		expected: "helloworld",
	}, {
		name: "disallowed punctuation is stripped",
		// Underscore, plus and slash are not part of
		// semanticAlphabet.
		input:    "a_b+c/d",
		expected: "abcd",
	}, {
		name:     "non-ascii runes are stripped",
		input:    "café-αβ",
		expected: "caf-",
	}, {
		name:     "all characters invalid",
		input:    "@#$%^&*()",
		expected: "",
	}, {
		name:     "full semver pre-release passes through",
		input:    "0.17.0-alpha.rc1",
		expected: "0.17.0-alpha.rc1",
	}}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			require.Equal(
				t, tc.expected, normalizeVerString(tc.input),
			)
		})
	}
}
