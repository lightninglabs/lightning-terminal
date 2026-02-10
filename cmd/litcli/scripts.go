package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/lightninglabs/lightning-terminal/litrpc"
	"github.com/urfave/cli"
)

var scriptCommands = []cli.Command{
	{
		Name:      "scripts",
		ShortName: "scr",
		Usage:     "Manage Starlark scripts for automation",
		Category:  "Scripts",
		Subcommands: []cli.Command{
			createScriptCommand,
			updateScriptCommand,
			deleteScriptCommand,
			getScriptCommand,
			listScriptsCommand,
			startScriptCommand,
			stopScriptCommand,
			listRunningScriptsCommand,
			validateScriptCommand,
			historyCommand,
			kvCommands,
		},
		Description: `
Manage Starlark scripts that can automate LND operations. Scripts have access
to LND and subdaemon RPCs using native macaroon permissions.

Scripts can be:
- Action scripts: Run once with optional timeout
- Daemon scripts: Run continuously with event subscriptions
`,
	},
}

var (
	scriptNameFlag = cli.StringFlag{
		Name:     "name",
		Usage:    "The unique name for the script",
		Required: true,
	}
	scriptFileFlag = cli.StringFlag{
		Name:  "file",
		Usage: "Path to the Starlark script file",
	}
	scriptSourceFlag = cli.StringFlag{
		Name:  "source",
		Usage: "Inline Starlark source code",
	}
	scriptDescFlag = cli.StringFlag{
		Name:  "description",
		Usage: "Description of what the script does",
	}
	scriptPermsFlag = cli.StringSliceFlag{
		Name: "perm",
		Usage: "Permission in format 'entity:action' (can be " +
			"specified multiple times)",
	}
	scriptTimeoutFlag = cli.UintFlag{
		Name:  "timeout",
		Usage: "Execution timeout in seconds (0 = no timeout)",
		Value: 0,
	}
	scriptMemoryFlag = cli.Uint64Flag{
		Name:  "max-memory",
		Usage: "Maximum memory in bytes (default: 100MB)",
		Value: 104857600,
	}
	scriptURLsFlag = cli.StringSliceFlag{
		Name:  "allowed-url",
		Usage: "URL pattern the script can access (can be specified multiple times)",
	}
	scriptBucketsFlag = cli.StringSliceFlag{
		Name:  "allowed-bucket",
		Usage: "KV bucket the script can access (can be specified multiple times)",
	}
	scriptArgsFlag = cli.StringFlag{
		Name:  "args",
		Usage: "JSON-encoded arguments to pass to main()",
	}
)

var createScriptCommand = cli.Command{
	Name:      "create",
	ShortName: "c",
	Usage:     "Create a new script",
	Action:    createScript,
	Flags: []cli.Flag{
		scriptNameFlag,
		scriptFileFlag,
		scriptSourceFlag,
		scriptDescFlag,
		scriptPermsFlag,
		scriptTimeoutFlag,
		scriptMemoryFlag,
		scriptURLsFlag,
		scriptBucketsFlag,
	},
	Description: `
Create a new Starlark script with the specified permissions. The script source
can be provided via --file or --source.

Example:
  litcli scripts create --name mybot --file bot.star \
    --perm "lnrpc.Lightning:read" \
    --perm "looprpc.SwapClient:write" \
    --allowed-url "https://api.example.com/*"
`,
}

func createScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	// Get source from file or flag.
	source, err := getScriptSource(ctx)
	if err != nil {
		return err
	}

	// Parse permissions.
	perms, err := parsePermissions(ctx.StringSlice("perm"))
	if err != nil {
		return err
	}

	req := &litrpc.CreateScriptRequest{
		Name:           ctx.String("name"),
		Description:    ctx.String("description"),
		Source:         source,
		Permissions:    perms,
		TimeoutSecs:    uint32(ctx.Uint("timeout")),
		MaxMemoryBytes: ctx.Uint64("max-memory"),
		AllowedUrls:    ctx.StringSlice("allowed-url"),
		AllowedBuckets: ctx.StringSlice("allowed-bucket"),
	}

	rpcCtx := getContext()
	resp, err := client.CreateScript(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var updateScriptCommand = cli.Command{
	Name:      "update",
	ShortName: "u",
	Usage:     "Update an existing script",
	Action:    updateScript,
	Flags: []cli.Flag{
		scriptNameFlag,
		scriptFileFlag,
		scriptSourceFlag,
		scriptDescFlag,
		scriptPermsFlag,
		scriptTimeoutFlag,
		scriptMemoryFlag,
		scriptURLsFlag,
		scriptBucketsFlag,
	},
	Description: `
Update an existing script's source code or configuration.
Only provided fields will be updated.
`,
}

func updateScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.UpdateScriptRequest{
		Name:        ctx.String("name"),
		Description: ctx.String("description"),
	}

	// Get source if provided.
	if ctx.IsSet("file") || ctx.IsSet("source") {
		source, err := getScriptSource(ctx)
		if err != nil {
			return err
		}
		req.Source = source
	}

	// Parse permissions if provided.
	if ctx.IsSet("perm") {
		perms, err := parsePermissions(ctx.StringSlice("perm"))
		if err != nil {
			return err
		}
		req.Permissions = perms
	}

	if ctx.IsSet("timeout") {
		req.TimeoutSecs = uint32(ctx.Uint("timeout"))
	}
	if ctx.IsSet("max-memory") {
		req.MaxMemoryBytes = ctx.Uint64("max-memory")
	}
	if ctx.IsSet("allowed-url") {
		req.AllowedUrls = ctx.StringSlice("allowed-url")
	}
	if ctx.IsSet("allowed-bucket") {
		req.AllowedBuckets = ctx.StringSlice("allowed-bucket")
	}

	rpcCtx := getContext()
	resp, err := client.UpdateScript(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var deleteScriptCommand = cli.Command{
	Name:      "delete",
	ShortName: "d",
	Usage:     "Delete a script",
	Action:    deleteScript,
	Flags: []cli.Flag{
		scriptNameFlag,
		cli.BoolFlag{
			Name:  "delete-kv",
			Usage: "Also delete the script's KV bucket data",
		},
	},
}

func deleteScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.DeleteScriptRequest{
		Name:         ctx.String("name"),
		DeleteKvData: ctx.Bool("delete-kv"),
	}

	rpcCtx := getContext()
	_, err = client.DeleteScript(rpcCtx, req)
	if err != nil {
		return err
	}

	fmt.Println("Script deleted successfully")
	return nil
}

var getScriptCommand = cli.Command{
	Name:      "get",
	ShortName: "g",
	Usage:     "Get a script by name",
	Action:    getScript,
	Flags: []cli.Flag{
		scriptNameFlag,
	},
}

func getScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.GetScriptRequest{
		Name: ctx.String("name"),
	}

	rpcCtx := getContext()
	resp, err := client.GetScript(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var listScriptsCommand = cli.Command{
	Name:      "list",
	ShortName: "l",
	Usage:     "List all scripts",
	Action:    listScripts,
}

func listScripts(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	rpcCtx := getContext()
	resp, err := client.ListScripts(rpcCtx, &litrpc.ListScriptsRequest{})
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var startScriptCommand = cli.Command{
	Name:      "start",
	ShortName: "s",
	Usage:     "Start a script",
	Action:    startScript,
	Flags: []cli.Flag{
		scriptNameFlag,
		scriptArgsFlag,
	},
	Description: `
Start execution of a script. For action scripts (with timeout), the result
is returned when execution completes. For daemon scripts (no timeout), the
script runs in the background with any configured subscriptions.

Example:
  litcli scripts start --name mybot --args '{"threshold": 0.8}'
`,
}

func startScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.StartScriptRequest{
		Name:     ctx.String("name"),
		ArgsJson: ctx.String("args"),
	}

	rpcCtx := getContext()
	resp, err := client.StartScript(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var stopScriptCommand = cli.Command{
	Name:   "stop",
	Usage:  "Stop a running script",
	Action: stopScript,
	Flags: []cli.Flag{
		scriptNameFlag,
	},
}

func stopScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.StopScriptRequest{
		Name: ctx.String("name"),
	}

	rpcCtx := getContext()
	_, err = client.StopScript(rpcCtx, req)
	if err != nil {
		return err
	}

	fmt.Println("Script stopped successfully")
	return nil
}

var listRunningScriptsCommand = cli.Command{
	Name:      "running",
	ShortName: "r",
	Usage:     "List running scripts",
	Action:    listRunningScripts,
}

func listRunningScripts(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	rpcCtx := getContext()
	resp, err := client.ListRunningScripts(rpcCtx, &litrpc.ListRunningScriptsRequest{})
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var validateScriptCommand = cli.Command{
	Name:      "validate",
	ShortName: "v",
	Usage:     "Validate a script without creating it",
	Action:    validateScript,
	Flags: []cli.Flag{
		scriptFileFlag,
		scriptSourceFlag,
	},
}

func validateScript(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	source, err := getScriptSource(ctx)
	if err != nil {
		return err
	}

	req := &litrpc.ValidateScriptRequest{
		Source: source,
	}

	rpcCtx := getContext()
	resp, err := client.ValidateScript(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

var historyCommand = cli.Command{
	Name:   "history",
	Usage:  "View script execution history",
	Action: getHistory,
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "name",
			Usage: "Script name (optional, shows all if not specified)",
		},
		cli.UintFlag{
			Name:  "limit",
			Usage: "Maximum number of entries to return",
			Value: 50,
		},
		cli.UintFlag{
			Name:  "offset",
			Usage: "Offset for pagination",
			Value: 0,
		},
	},
}

func getHistory(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.GetExecutionHistoryRequest{
		Name:   ctx.String("name"),
		Limit:  uint32(ctx.Uint("limit")),
		Offset: uint32(ctx.Uint("offset")),
	}

	rpcCtx := getContext()
	resp, err := client.GetExecutionHistory(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

// KV store commands
var kvCommands = cli.Command{
	Name:      "kv",
	ShortName: "k",
	Usage:     "Manage script KV store",
	Subcommands: []cli.Command{
		kvGetCommand,
		kvPutCommand,
		kvDeleteCommand,
		kvListCommand,
	},
}

var (
	kvBucketFlag = cli.StringFlag{
		Name:     "bucket",
		Usage:    "Bucket name",
		Required: true,
	}
	kvKeyFlag = cli.StringFlag{
		Name:     "key",
		Usage:    "Key name",
		Required: true,
	}
	kvValueFlag = cli.StringFlag{
		Name:  "value",
		Usage: "Value to store",
	}
	kvPrefixFlag = cli.StringFlag{
		Name:  "prefix",
		Usage: "Key prefix filter",
	}
)

var kvGetCommand = cli.Command{
	Name:   "get",
	Usage:  "Get a value from the KV store",
	Action: kvGet,
	Flags: []cli.Flag{
		kvBucketFlag,
		kvKeyFlag,
	},
}

func kvGet(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.KVGetRequest{
		Bucket: ctx.String("bucket"),
		Key:    ctx.String("key"),
	}

	rpcCtx := getContext()
	resp, err := client.KVGet(rpcCtx, req)
	if err != nil {
		return err
	}

	if !resp.Found {
		fmt.Println("Key not found")
		return nil
	}

	fmt.Printf("%s\n", string(resp.Value))
	return nil
}

var kvPutCommand = cli.Command{
	Name:   "put",
	Usage:  "Store a value in the KV store",
	Action: kvPut,
	Flags: []cli.Flag{
		kvBucketFlag,
		kvKeyFlag,
		kvValueFlag,
	},
}

func kvPut(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.KVPutRequest{
		Bucket: ctx.String("bucket"),
		Key:    ctx.String("key"),
		Value:  []byte(ctx.String("value")),
	}

	rpcCtx := getContext()
	_, err = client.KVPut(rpcCtx, req)
	if err != nil {
		return err
	}

	fmt.Println("Value stored successfully")
	return nil
}

var kvDeleteCommand = cli.Command{
	Name:   "delete",
	Usage:  "Delete a value from the KV store",
	Action: kvDelete,
	Flags: []cli.Flag{
		kvBucketFlag,
		kvKeyFlag,
	},
}

func kvDelete(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.KVDeleteRequest{
		Bucket: ctx.String("bucket"),
		Key:    ctx.String("key"),
	}

	rpcCtx := getContext()
	_, err = client.KVDelete(rpcCtx, req)
	if err != nil {
		return err
	}

	fmt.Println("Value deleted successfully")
	return nil
}

var kvListCommand = cli.Command{
	Name:   "list",
	Usage:  "List keys in a bucket",
	Action: kvList,
	Flags: []cli.Flag{
		kvBucketFlag,
		kvPrefixFlag,
	},
}

func kvList(ctx *cli.Context) error {
	clientConn, cleanup, err := connectClient(ctx, false)
	if err != nil {
		return err
	}
	defer cleanup()
	client := litrpc.NewScriptsClient(clientConn)

	req := &litrpc.KVListRequest{
		Bucket: ctx.String("bucket"),
		Prefix: ctx.String("prefix"),
	}

	rpcCtx := getContext()
	resp, err := client.KVList(rpcCtx, req)
	if err != nil {
		return err
	}

	printRespJSON(resp)
	return nil
}

// Helper functions

func getScriptSource(ctx *cli.Context) (string, error) {
	if ctx.IsSet("file") {
		content, err := os.ReadFile(ctx.String("file"))
		if err != nil {
			return "", fmt.Errorf("failed to read script file: %w", err)
		}
		return string(content), nil
	}

	if ctx.IsSet("source") {
		return ctx.String("source"), nil
	}

	return "", fmt.Errorf("either --file or --source must be provided")
}

func parsePermissions(perms []string) ([]*litrpc.MacaroonPermission, error) {
	result := make([]*litrpc.MacaroonPermission, 0, len(perms))

	for _, perm := range perms {
		// Parse "entity:action" format.
		var entity, action string
		n, err := fmt.Sscanf(perm, "%s:%s", &entity, &action)
		if err != nil || n != 2 {
			// Try splitting on colon.
			parts := splitOnce(perm, ':')
			if len(parts) != 2 {
				return nil, fmt.Errorf("invalid permission format '%s', "+
					"expected 'entity:action'", perm)
			}
			entity = parts[0]
			action = parts[1]
		}

		result = append(result, &litrpc.MacaroonPermission{
			Entity: entity,
			Action: action,
		})
	}

	return result, nil
}

func splitOnce(s string, sep byte) []string {
	for i := 0; i < len(s); i++ {
		if s[i] == sep {
			return []string{s[:i], s[i+1:]}
		}
	}
	return []string{s}
}

// For JSON output consistency.
func printScriptJSON(script *litrpc.Script) {
	data, err := json.MarshalIndent(script, "", "  ")
	if err != nil {
		fmt.Printf("Error formatting output: %v\n", err)
		return
	}
	fmt.Println(string(data))
}
