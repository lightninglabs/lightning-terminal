package main

import (
	"testing"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/lightningnetwork/lnd/macaroons"
	"github.com/stretchr/testify/require"
)

// TestParseCustomPermissions tests that custom permissions (URIs and
// entity:action pairs) are parsed and validated correctly.
func TestParseCustomPermissions(t *testing.T) {
	customURI := macaroons.PermissionEntityCustomURI

	tests := []struct {
		name        string
		uris        []string
		permissions []string
		expected    []*litrpc.MacaroonPermission
		expectErr   bool
		errContains string
	}{
		{
			name: "valid URIs only",
			uris: []string{
				"/lnrpc.Lightning/GetInfo",
				"/lnrpc.Lightning/UpdateChannelPolicy",
			},
			permissions: nil,
			expected: []*litrpc.MacaroonPermission{
				{
					Entity: customURI,
					Action: "/lnrpc.Lightning/GetInfo",
				},
				{
					Entity: customURI,
					Action: "/lnrpc.Lightning/" +
						"UpdateChannelPolicy",
				},
			},
			expectErr: false,
		},
		{
			name: "valid permissions only - repeated flags",
			uris: nil,
			permissions: []string{
				"info:read",
				"offchain:write",
			},
			expected: []*litrpc.MacaroonPermission{
				{
					Entity: "info",
					Action: "read",
				},
				{
					Entity: "offchain",
					Action: "write",
				},
			},
			expectErr: false,
		},
		{
			name: "valid permissions only - comma separated",
			uris: nil,
			permissions: []string{
				"info:read,offchain:write",
			},
			expected: []*litrpc.MacaroonPermission{
				{
					Entity: "info",
					Action: "read",
				},
				{
					Entity: "offchain",
					Action: "write",
				},
			},
			expectErr: false,
		},
		{
			name: "valid permissions only - mixed with whitespace",
			uris: nil,
			permissions: []string{
				" info:read ,  offchain:write  ",
			},
			expected: []*litrpc.MacaroonPermission{
				{
					Entity: "info",
					Action: "read",
				},
				{
					Entity: "offchain",
					Action: "write",
				},
			},
			expectErr: false,
		},
		{
			name: "combination of URIs and permissions",
			uris: []string{
				"/lnrpc.Lightning/GetInfo",
			},
			permissions: []string{
				"info:read,offchain:write",
				"onchain:read",
			},
			expected: []*litrpc.MacaroonPermission{
				{
					Entity: customURI,
					Action: "/lnrpc.Lightning/GetInfo",
				},
				{
					Entity: "info",
					Action: "read",
				},
				{
					Entity: "offchain",
					Action: "write",
				},
				{
					Entity: "onchain",
					Action: "read",
				},
			},
			expectErr: false,
		},
		{
			name:        "invalid perm - missing colon",
			uris:        nil,
			permissions: []string{"inforead"},
			expectErr:   true,
			errContains: "must be entity:action",
		},
		{
			name:        "invalid perm - multiple colons",
			uris:        nil,
			permissions: []string{"info:read:extra"},
			expectErr:   true,
			errContains: "must be entity:action",
		},
		{
			name:        "invalid perm - empty entity",
			uris:        nil,
			permissions: []string{":read"},
			expectErr:   true,
			errContains: "entity and action must not be empty",
		},
		{
			name:        "invalid perm - empty action",
			uris:        nil,
			permissions: []string{"info:"},
			expectErr:   true,
			errContains: "entity and action must not be empty",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual, err := parseCustomPermissions(
				tt.uris, tt.permissions,
			)
			if tt.expectErr {
				require.Error(t, err)
				require.Contains(t, err.Error(), tt.errContains)
				require.Nil(t, actual)
			} else {
				require.NoError(t, err)
				require.Equal(t, tt.expected, actual)
			}
		})
	}
}
