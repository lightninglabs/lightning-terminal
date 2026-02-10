package scripting

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gobwas/glob"
	"go.starlark.net/starlark"
)

const (
	// MaxHTTPResponseSize is the maximum response body size we'll read.
	MaxHTTPResponseSize = 10 * 1024 * 1024 // 10MB

	// HTTPRequestTimeout is the timeout for HTTP requests.
	HTTPRequestTimeout = 30 * time.Second
)

// registerHTTPBuiltins adds HTTP-related builtin functions.
func (e *Engine) registerHTTPBuiltins(predeclared starlark.StringDict) {
	predeclared["http_get"] = starlark.NewBuiltin("http_get", e.builtinHTTPGet)
}

// builtinHTTPGet implements http_get(url, headers={}).
func (e *Engine) builtinHTTPGet(thread *starlark.Thread, fn *starlark.Builtin,
	args starlark.Tuple, kwargs []starlark.Tuple) (starlark.Value, error) {

	var url string
	var headersDict *starlark.Dict

	if err := starlark.UnpackArgs("http_get", args, kwargs,
		"url", &url,
		"headers?", &headersDict,
	); err != nil {
		return nil, err
	}

	// Validate URL against allowlist.
	if !e.isURLAllowed(url) {
		return nil, fmt.Errorf("URL not in allowlist: %s", url)
	}

	// Check sandbox context before making request.
	if err := e.sandbox.CheckContext(); err != nil {
		return nil, err
	}

	// Create HTTP client with timeout.
	client := &http.Client{
		Timeout: HTTPRequestTimeout,
	}

	// Create request.
	req, err := http.NewRequestWithContext(e.sandbox.Context(), "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add custom headers if provided.
	if headersDict != nil {
		for _, item := range headersDict.Items() {
			key, ok := item[0].(starlark.String)
			if !ok {
				return nil, fmt.Errorf("header key must be string")
			}
			value, ok := item[1].(starlark.String)
			if !ok {
				return nil, fmt.Errorf("header value must be string")
			}
			req.Header.Set(string(key), string(value))
		}
	}

	// Set a reasonable User-Agent.
	if req.Header.Get("User-Agent") == "" {
		req.Header.Set("User-Agent", "LiT-Script/1.0")
	}

	// Make the request.
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body with size limit.
	bodyReader := io.LimitReader(resp.Body, MaxHTTPResponseSize)
	body, err := io.ReadAll(bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Track memory usage for the response body.
	if err := e.sandbox.CheckMemory(int64(len(body))); err != nil {
		return nil, err
	}
	defer e.sandbox.ReleaseMemory(int64(len(body)))

	// Build response dictionary.
	result := NewStarlarkDict()

	if err := result.Set("status", resp.StatusCode); err != nil {
		return nil, err
	}

	if err := result.Set("body", string(body)); err != nil {
		return nil, err
	}

	// Convert response headers to dict.
	headersResult := starlark.NewDict(len(resp.Header))
	for key, values := range resp.Header {
		// Join multiple values with comma.
		value := strings.Join(values, ", ")
		if err := headersResult.SetKey(
			starlark.String(key),
			starlark.String(value),
		); err != nil {
			return nil, err
		}
	}
	if err := result.SetStarlark("headers", headersResult); err != nil {
		return nil, err
	}

	return result.Dict(), nil
}

// isURLAllowed checks if a URL matches the script's allowlist.
func (e *Engine) isURLAllowed(url string) bool {
	// If no allowlist is configured, deny all URLs.
	if len(e.allowedURLs) == 0 {
		return false
	}

	for _, pattern := range e.allowedURLs {
		// Check for exact match first.
		if pattern == url {
			return true
		}

		// Try glob matching.
		g, err := glob.Compile(pattern)
		if err != nil {
			// Invalid pattern, skip.
			log.Warnf("Invalid URL pattern '%s': %v", pattern, err)
			continue
		}

		if g.Match(url) {
			return true
		}
	}

	return false
}
