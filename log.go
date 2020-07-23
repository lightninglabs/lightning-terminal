package terminal

import (
	"github.com/btcsuite/btclog"
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/faraday/dataset"
	"github.com/lightninglabs/faraday/fiat"
	"github.com/lightninglabs/faraday/frdrpc"
	"github.com/lightninglabs/faraday/recommend"
	"github.com/lightninglabs/faraday/revenue"
	"github.com/lightninglabs/lndclient"
	"github.com/lightninglabs/loop"
	"github.com/lightninglabs/loop/loopdb"
	"github.com/lightninglabs/loop/lsat"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/build"
	"google.golang.org/grpc/grpclog"
)

var (
	// log is a logger that is initialized with no output filters. This
	// means the package will not perform any logging by default until the
	// caller requests it.
	log btclog.Logger
)

const (
	// Subsystem defines the logging code for this subsystem.
	Subsystem = "LITD"

	// GrpcLogSubsystem defines the logging code for the gRPC subsystem.
	GrpcLogSubsystem = "GRPC"

	// levelDiffToGRPCLogger is the difference in numerical log level
	// definitions between the grpclog package and the btclog package.
	levelDiffToGRPCLogger = 2
)

// The default amount of logging is none.
func init() {
	UseLogger(build.NewSubLogger(Subsystem, nil))
}

// UseLogger uses a specified Logger to output package logging info.  This
// should be used in preference to SetLogWriter if the caller is also using
// btclog.
func UseLogger(logger btclog.Logger) {
	log = logger
}

// SetupLoggers initializes all package-global logger variables.
func SetupLoggers(root *build.RotatingLogWriter) {
	// Add the lightning-terminal root logger.
	lnd.AddSubLogger(root, Subsystem, UseLogger)

	// Add faraday loggers to lnd's root logger.
	lnd.AddSubLogger(root, faraday.Subsystem, faraday.UseLogger)
	lnd.AddSubLogger(root, recommend.Subsystem, recommend.UseLogger)
	lnd.AddSubLogger(root, dataset.Subsystem, dataset.UseLogger)
	lnd.AddSubLogger(root, frdrpc.Subsystem, frdrpc.UseLogger)
	lnd.AddSubLogger(root, revenue.Subsystem, revenue.UseLogger)
	lnd.AddSubLogger(root, fiat.Subsystem, fiat.UseLogger)

	// Add loop loggers to lnd's root logger.
	lnd.AddSubLogger(root, "LOOPD", loopdb.UseLogger)
	lnd.AddSubLogger(root, "LOOP", loop.UseLogger)
	lnd.AddSubLogger(root, "LNDC", lndclient.UseLogger)
	lnd.AddSubLogger(root, "STORE", loopdb.UseLogger)
	lnd.AddSubLogger(root, lsat.Subsystem, lsat.UseLogger)
}

// NewGrpcLogLogger creates a new grpclog compatible logger and attaches it as
// a sub logger to the passed root logger.
func NewGrpcLogLogger(root *build.RotatingLogWriter,
	subsystem string) *GrpcLogLogger {

	logger := build.NewSubLogger(subsystem, root.GenSubLogger)
	lnd.SetSubLogger(root, subsystem, logger)
	return &GrpcLogLogger{
		Logger: logger,
	}
}

// GrpcLogLogger is a wrapper around a btclog logger to make it compatible with
// the grpclog logger package.
type GrpcLogLogger struct {
	btclog.Logger
}

func (l GrpcLogLogger) Infoln(args ...interface{}) {
	l.Logger.Error(args...)
}

func (l GrpcLogLogger) Warning(args ...interface{}) {
	l.Logger.Warn(args...)
}

func (l GrpcLogLogger) Warningln(args ...interface{}) {
	l.Logger.Warn(args...)
}

func (l GrpcLogLogger) Warningf(format string, args ...interface{}) {
	l.Logger.Warnf(format, args...)
}

func (l GrpcLogLogger) Errorln(args ...interface{}) {
	l.Logger.Error(args...)
}

func (l GrpcLogLogger) Fatal(args ...interface{}) {
	l.Logger.Critical(args...)
}

func (l GrpcLogLogger) Fatalln(args ...interface{}) {
	l.Logger.Critical(args...)
}

func (l GrpcLogLogger) Fatalf(format string, args ...interface{}) {
	l.Logger.Criticalf(format, args...)
}

func (l GrpcLogLogger) V(level int) bool {
	return level+levelDiffToGRPCLogger >= int(l.Logger.Level())
}

// A compile-time check to make sure our GrpcLogLogger satisfies the
// grpclog.LoggerV2 interface.
var _ grpclog.LoggerV2 = (*GrpcLogLogger)(nil)
