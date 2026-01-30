package itest

import (
	"context"
	"encoding/hex"
	"os"
	"testing"
	"time"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
)

// testScriptBasicCRUD tests basic script create, read, update, delete operations.
func testScriptBasicCRUD(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	// Connect to Alice's LiT node
	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Test 1: Create a simple script
	t.t.Log("Creating a simple script...")
	createResp, err := scriptClient.CreateScript(ctxt, &litrpc.CreateScriptRequest{
		Name:        "test-script-crud",
		Description: "A test script for CRUD operations",
		Source: `
def main():
    return {"status": "ok", "message": "Hello from Starlark!"}
`,
		Permissions: []*litrpc.MacaroonPermission{
			{Entity: "lnrpc.Lightning", Action: "read"},
		},
	})
	require.NoError(t.t, err)
	require.NotNil(t.t, createResp.Script)
	require.Equal(t.t, "test-script-crud", createResp.Script.Name)
	require.False(t.t, createResp.Script.IsRunning)

	// Test 2: Get the script
	t.t.Log("Getting the script...")
	getResp, err := scriptClient.GetScript(ctxt, &litrpc.GetScriptRequest{
		Name: "test-script-crud",
	})
	require.NoError(t.t, err)
	require.Equal(t.t, "test-script-crud", getResp.Script.Name)
	require.Equal(t.t, "A test script for CRUD operations", getResp.Script.Description)

	// Test 3: List scripts
	t.t.Log("Listing scripts...")
	listResp, err := scriptClient.ListScripts(ctxt, &litrpc.ListScriptsRequest{})
	require.NoError(t.t, err)
	require.GreaterOrEqual(t.t, len(listResp.Scripts), 1)

	found := false
	for _, s := range listResp.Scripts {
		if s.Name == "test-script-crud" {
			found = true
			break
		}
	}
	require.True(t.t, found, "test-script-crud should be in the list")

	// Test 4: Update the script
	t.t.Log("Updating the script...")
	updateResp, err := scriptClient.UpdateScript(ctxt, &litrpc.UpdateScriptRequest{
		Name:        "test-script-crud",
		Description: "Updated description",
		Source: `
def main():
    return {"status": "updated", "message": "Script was updated!"}
`,
	})
	require.NoError(t.t, err)
	require.Equal(t.t, "Updated description", updateResp.Script.Description)

	// Test 5: Delete the script
	t.t.Log("Deleting the script...")
	_, err = scriptClient.DeleteScript(ctxt, &litrpc.DeleteScriptRequest{
		Name:         "test-script-crud",
		DeleteKvData: true,
	})
	require.NoError(t.t, err)

	// Verify deletion
	_, err = scriptClient.GetScript(ctxt, &litrpc.GetScriptRequest{
		Name: "test-script-crud",
	})
	require.Error(t.t, err)
}

// testScriptValidation tests script syntax validation.
func testScriptValidation(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Test 1: Valid script
	t.t.Log("Validating a valid script...")
	validResp, err := scriptClient.ValidateScript(ctxt, &litrpc.ValidateScriptRequest{
		Source: `
def main():
    x = 1 + 2
    return {"result": x}
`,
	})
	require.NoError(t.t, err)
	require.True(t.t, validResp.Valid)
	require.Empty(t.t, validResp.Error)

	// Test 2: Invalid script (syntax error)
	t.t.Log("Validating an invalid script...")
	invalidResp, err := scriptClient.ValidateScript(ctxt, &litrpc.ValidateScriptRequest{
		Source: `
def main(
    return {"broken": True}
`,
	})
	require.NoError(t.t, err)
	require.False(t.t, invalidResp.Valid)
	require.NotEmpty(t.t, invalidResp.Error)

	// Test 3: Script without main function (warning)
	t.t.Log("Validating script without main...")
	noMainResp, err := scriptClient.ValidateScript(ctxt, &litrpc.ValidateScriptRequest{
		Source: `
def helper():
    return 42
`,
	})
	require.NoError(t.t, err)
	require.True(t.t, noMainResp.Valid)
	require.Greater(t.t, len(noMainResp.Warnings), 0)
}

// testScriptExecution tests basic script execution.
func testScriptExecution(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Create a script with a timeout (short-running)
	t.t.Log("Creating an executable script...")
	_, err := scriptClient.CreateScript(ctxt, &litrpc.CreateScriptRequest{
		Name: "test-exec-script",
		Source: `
def main(x=10, y=20):
    result = x + y
    return {"sum": result, "inputs": {"x": x, "y": y}}
`,
		Permissions: []*litrpc.MacaroonPermission{
			{Entity: "lnrpc.Lightning", Action: "read"},
		},
		TimeoutSecs: 30, // 30 second timeout
	})
	require.NoError(t.t, err)

	// Execute with default arguments
	t.t.Log("Executing script with defaults...")
	execResp, err := scriptClient.StartScript(ctxt, &litrpc.StartScriptRequest{
		Name: "test-exec-script",
	})
	require.NoError(t.t, err)
	require.NotZero(t.t, execResp.ExecutionId)
	require.Contains(t.t, execResp.ResultJson, `"sum"`)
	require.Contains(t.t, execResp.ResultJson, "30") // 10 + 20

	// Wait a moment for execution to complete
	time.Sleep(100 * time.Millisecond)

	// Execute with custom arguments
	t.t.Log("Executing script with custom args...")
	execResp2, err := scriptClient.StartScript(ctxt, &litrpc.StartScriptRequest{
		Name:     "test-exec-script",
		ArgsJson: `{"x": 100, "y": 200}`,
	})
	require.NoError(t.t, err)
	require.Contains(t.t, execResp2.ResultJson, "300") // 100 + 200

	// Check execution history
	t.t.Log("Checking execution history...")
	histResp, err := scriptClient.GetExecutionHistory(ctxt, &litrpc.GetExecutionHistoryRequest{
		Name:  "test-exec-script",
		Limit: 10,
	})
	require.NoError(t.t, err)
	require.GreaterOrEqual(t.t, len(histResp.Executions), 2)

	// Verify execution states
	for _, exec := range histResp.Executions {
		require.Equal(t.t, "test-exec-script", exec.ScriptName)
		require.Equal(t.t, "completed", exec.State)
	}

	// Cleanup
	_, err = scriptClient.DeleteScript(ctxt, &litrpc.DeleteScriptRequest{
		Name: "test-exec-script",
	})
	require.NoError(t.t, err)
}

// testScriptKVStore tests the script KV store operations.
func testScriptKVStore(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	bucket := "test-bucket"

	// Test 1: Put a value
	t.t.Log("Putting a KV value...")
	_, err := scriptClient.KVPut(ctxt, &litrpc.KVPutRequest{
		Bucket: bucket,
		Key:    "test-key",
		Value:  []byte("test-value"),
	})
	require.NoError(t.t, err)

	// Test 2: Get the value
	t.t.Log("Getting the KV value...")
	getResp, err := scriptClient.KVGet(ctxt, &litrpc.KVGetRequest{
		Bucket: bucket,
		Key:    "test-key",
	})
	require.NoError(t.t, err)
	require.True(t.t, getResp.Found)
	require.Equal(t.t, "test-value", string(getResp.Value))

	// Test 3: Get non-existent key
	t.t.Log("Getting non-existent key...")
	getResp2, err := scriptClient.KVGet(ctxt, &litrpc.KVGetRequest{
		Bucket: bucket,
		Key:    "non-existent",
	})
	require.NoError(t.t, err)
	require.False(t.t, getResp2.Found)

	// Test 4: Put more values for listing
	for i := 0; i < 5; i++ {
		_, err := scriptClient.KVPut(ctxt, &litrpc.KVPutRequest{
			Bucket: bucket,
			Key:    "prefix-" + string(rune('a'+i)),
			Value:  []byte("value-" + string(rune('a'+i))),
		})
		require.NoError(t.t, err)
	}

	// Test 5: List keys with prefix
	t.t.Log("Listing keys with prefix...")
	listResp, err := scriptClient.KVList(ctxt, &litrpc.KVListRequest{
		Bucket: bucket,
		Prefix: "prefix-",
	})
	require.NoError(t.t, err)
	require.Equal(t.t, 5, len(listResp.Keys))

	// Test 6: Delete a key
	t.t.Log("Deleting a KV key...")
	_, err = scriptClient.KVDelete(ctxt, &litrpc.KVDeleteRequest{
		Bucket: bucket,
		Key:    "test-key",
	})
	require.NoError(t.t, err)

	// Verify deletion
	getResp3, err := scriptClient.KVGet(ctxt, &litrpc.KVGetRequest{
		Bucket: bucket,
		Key:    "test-key",
	})
	require.NoError(t.t, err)
	require.False(t.t, getResp3.Found)
}

// testScriptWithLNDAccess tests scripts that access LND RPCs.
func testScriptWithLNDAccess(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Create a script that calls LND get_info
	t.t.Log("Creating script that accesses LND...")
	_, err := scriptClient.CreateScript(ctxt, &litrpc.CreateScriptRequest{
		Name: "test-lnd-access",
		Source: `
def main():
    info = lnd.get_info()
    balance = lnd.channel_balance()
    return {
        "pubkey": info["identity_pubkey"],
        "alias": info["alias"],
        "num_channels": info["num_active_channels"],
        "local_balance": balance["local_balance"],
    }
`,
		Permissions: []*litrpc.MacaroonPermission{
			{Entity: "lnrpc.Lightning", Action: "read"},
		},
		TimeoutSecs: 30,
	})
	require.NoError(t.t, err)

	// Execute the script
	t.t.Log("Executing LND access script...")
	execResp, err := scriptClient.StartScript(ctxt, &litrpc.StartScriptRequest{
		Name: "test-lnd-access",
	})
	require.NoError(t.t, err)

	// The result should contain the node's pubkey
	require.Contains(t.t, execResp.ResultJson, "pubkey")
	require.Contains(t.t, execResp.ResultJson, "alias")

	// Cleanup
	_, err = scriptClient.DeleteScript(ctxt, &litrpc.DeleteScriptRequest{
		Name: "test-lnd-access",
	})
	require.NoError(t.t, err)
}

// testScriptBuiltins tests the built-in functions.
func testScriptBuiltins(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Create a script that tests various builtins
	t.t.Log("Creating script with builtin tests...")
	_, err := scriptClient.CreateScript(ctxt, &litrpc.CreateScriptRequest{
		Name: "test-builtins",
		Source: `
def main():
    # Test now()
    timestamp = now()

    # Test json_encode/decode
    data = {"key": "value", "number": 42}
    encoded = json_encode(data)
    decoded = json_decode(encoded)

    # Test print and log
    print("Testing print")
    log("info", "Testing log")

    return {
        "timestamp": timestamp,
        "encoded": encoded,
        "decoded_key": decoded["key"],
        "decoded_number": decoded["number"],
    }
`,
		Permissions: []*litrpc.MacaroonPermission{
			{Entity: "lnrpc.Lightning", Action: "read"},
		},
		TimeoutSecs: 30,
	})
	require.NoError(t.t, err)

	// Execute the script
	t.t.Log("Executing builtin test script...")
	execResp, err := scriptClient.StartScript(ctxt, &litrpc.StartScriptRequest{
		Name: "test-builtins",
	})
	require.NoError(t.t, err)
	require.Contains(t.t, execResp.ResultJson, "timestamp")
	require.Contains(t.t, execResp.ResultJson, "encoded")
	require.Contains(t.t, execResp.ResultJson, "decoded_key")

	// Cleanup
	_, err = scriptClient.DeleteScript(ctxt, &litrpc.DeleteScriptRequest{
		Name: "test-builtins",
	})
	require.NoError(t.t, err)
}

// testScriptWithKVBuiltins tests scripts using built-in KV functions.
func testScriptWithKVBuiltins(ctx context.Context, net *NetworkHarness,
	t *harnessTest) {

	ctxt, cancel := context.WithTimeout(ctx, defaultTimeout)
	defer cancel()

	alice := net.Alice
	conn := connectToLitRPC(t.t, ctxt, alice)
	defer conn.Close()

	scriptClient := litrpc.NewScriptsClient(conn)

	// Create a script that uses KV builtins
	t.t.Log("Creating script with KV builtins...")
	_, err := scriptClient.CreateScript(ctxt, &litrpc.CreateScriptRequest{
		Name: "test-kv-builtins",
		Source: `
def main():
    # Store some values
    kv_put("counter", "0")
    kv_put("name", "test-script")

    # Read them back
    counter = kv_get("counter")
    name = kv_get("name")

    # Update counter
    kv_put("counter", "1")
    new_counter = kv_get("counter")

    # List keys
    keys = kv_list()

    return {
        "initial_counter": counter,
        "name": name,
        "updated_counter": new_counter,
        "num_keys": len(keys),
    }
`,
		Permissions: []*litrpc.MacaroonPermission{
			{Entity: "lnrpc.Lightning", Action: "read"},
		},
		TimeoutSecs: 30,
	})
	require.NoError(t.t, err)

	// Execute the script
	t.t.Log("Executing KV builtin test script...")
	execResp, err := scriptClient.StartScript(ctxt, &litrpc.StartScriptRequest{
		Name: "test-kv-builtins",
	})
	require.NoError(t.t, err)
	require.Contains(t.t, execResp.ResultJson, `"initial_counter"`)
	require.Contains(t.t, execResp.ResultJson, `"updated_counter"`)

	// Cleanup
	_, err = scriptClient.DeleteScript(ctxt, &litrpc.DeleteScriptRequest{
		Name:         "test-kv-builtins",
		DeleteKvData: true,
	})
	require.NoError(t.t, err)
}

// Helper function to connect to LiT RPC
func connectToLitRPC(t *testing.T, ctx context.Context, node *HarnessNode) *grpc.ClientConn {
	tlsCreds, err := credentials.NewClientTLSFromFile(
		node.Cfg.LitTLSCertPath, "",
	)
	require.NoError(t, err)

	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(tlsCreds),
	}

	// Read the LiT macaroon
	macBytes, err := os.ReadFile(node.Cfg.LitMacPath)
	require.NoError(t, err)

	// Add macaroon to context via interceptor
	macHex := hex.EncodeToString(macBytes)
	opts = append(opts, grpc.WithUnaryInterceptor(
		func(ctx context.Context, method string, req, reply interface{},
			cc *grpc.ClientConn, invoker grpc.UnaryInvoker,
			opts ...grpc.CallOption) error {

			md := metadata.Pairs("macaroon", macHex)
			ctx = metadata.NewOutgoingContext(ctx, md)
			return invoker(ctx, method, req, reply, cc, opts...)
		},
	))

	conn, err := grpc.DialContext(ctx, node.Cfg.LitAddr(), opts...)
	require.NoError(t, err)

	return conn
}
