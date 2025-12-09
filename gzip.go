package terminal

import (
	"compress/gzip"
	"io"
	"net/http"
	"strings"
)

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

// Use the Writer part of gzipResponseWriter to write the output.

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func makeGzipHandler(handler http.HandlerFunc) http.HandlerFunc {
	return func(resp http.ResponseWriter, req *http.Request) {
		// Check if the client can accept the gzip encoding.
		isGzipEncoding := strings.Contains(
			req.Header.Get("Accept-Encoding"), "gzip",
		)
		if !isGzipEncoding {
			// The client cannot accept it, so return the output
			// uncompressed.
			handler(resp, req)
			return
		}
		// Set the HTTP header indicating encoding.
		resp.Header().Set("Content-Encoding", "gzip")
		gzipWriter := gzip.NewWriter(resp)
		defer gzipWriter.Close()
		gzipRespWriter := gzipResponseWriter{
			Writer: gzipWriter, ResponseWriter: resp,
		}
		handler(gzipRespWriter, req)
	}
}
