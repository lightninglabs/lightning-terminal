package terminal

import (
	"github.com/btcsuite/btclog"
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/autopilotserver"
	"github.com/lightninglabs/lightning-terminal/firewall"
	"github.com/lightninglabs/lightning-terminal/firewalldb"
	mid "github.com/lightninglabs/lightning-terminal/rpcmiddleware"
	"github.com/lightninglabs/lightning-terminal/rules"
	"github.com/lightninglabs/lightning-terminal/session"
	"github.com/lightninglabs/lightning-terminal/status"
	"github.com/lightninglabs/lightning-terminal/subservers"
	"github.com/lightninglabs/loop/loopd"
	"github.com/lightninglabs/pool"
	tap "github.com/lightninglabs/taproot-assets"
	"github.com/lightningnetwork/lnd"
	"github.com/lightningnetwork/lnd/build"
	"github.com/lightningnetwork/lnd/signal"
	"google.golang.org/grpc/grpclog"
)

var (
	// log is a logger that is initialized with no output filters. This
	// means the package will not perform any logging by default until the
	// caller requests it.
	log btclog.Logger

	// interceptor is the OS signal interceptor that we need to keep a
	// reference to for listening for shutdown signals.
	interceptor signal.Interceptor
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
func SetupLoggers(root *build.RotatingLogWriter, intercept signal.Interceptor) {
	genLogger := genSubLogger(root, intercept)

	log = build.NewSubLogger(Subsystem, genLogger)
	interceptor = intercept

	// Add the lightning-terminal root logger.
	lnd.AddSubLogger(root, Subsystem, intercept, UseLogger)
	lnd.AddSubLogger(root, session.Subsystem, intercept, session.UseLogger)
	lnd.AddSubLogger(root, mailbox.Subsystem, intercept, mailbox.UseLogger)
	lnd.AddSubLogger(root, mid.Subsystem, intercept, mid.UseLogger)
	lnd.AddSubLogger(
		root, accounts.Subsystem, intercept, accounts.UseLogger,
	)
	lnd.AddSubLogger(
		root, firewall.Subsystem, intercept, firewall.UseLogger,
	)
	lnd.AddSubLogger(
		root, firewalldb.Subsystem, intercept, firewalldb.UseLogger,
	)
	lnd.AddSubLogger(root, rules.Subsystem, intercept, rules.UseLogger)
	lnd.AddSubLogger(
		root, autopilotserver.Subsystem, intercept,
		autopilotserver.UseLogger,
	)
	lnd.AddSubLogger(root, status.Subsystem, intercept, status.UseLogger)
	lnd.AddSubLogger(
		root, subservers.Subsystem, intercept, subservers.UseLogger,
	)

	// Add daemon loggers to lnd's root logger.
	faraday.SetupLoggers(root, intercept)
	loopd.SetupLoggers(root, intercept)
	pool.SetupLoggers(root, intercept)
	tap.SetupLoggers(root, intercept)

	// Setup the gRPC loggers too.
	grpclog.SetLoggerV2(NewGrpcLogLogger(root, intercept, GrpcLogSubsystem))
}

// genSubLogger creates a logger for a subsystem. We provide an instance of
// a signal.Interceptor to be able to shutdown in the case of a critical error.
func genSubLogger(root *build.RotatingLogWriter,
	interceptor signal.Interceptor) func(string) btclog.Logger {

	// Create a shutdown function which will request shutdown from our
	// interceptor if it is listening.
	shutdown := func() {
		if !interceptor.Listening() {
			return
		}

		interceptor.RequestShutdown()
	}

	// Return a function which will create a sublogger from our root
	// logger without shutdown fn.
	return func(tag string) btclog.Logger {
		return root.GenSubLogger(tag, shutdown)
	}
}

// NewGrpcLogLogger creates a new grpclog compatible logger and attaches it as
// a sub logger to the passed root logger.
func NewGrpcLogLogger(root *build.RotatingLogWriter,
	intercept signal.Interceptor, subsystem string) *GrpcLogLogger {

	logger := build.NewSubLogger(subsystem, genSubLogger(root, intercept))
	lnd.SetSubLogger(root, subsystem, logger)
	return &GrpcLogLogger{
		Logger: logger,
	}
}

// GrpcLogLogger is a wrapper around a btclog logger to make it compatible with
// the grpclog logger package. By default we downgrade the info level to debug
// to reduce the verbosity of the logger.
type GrpcLogLogger struct {
	btclog.Logger
}

func (l GrpcLogLogger) Info(args ...interface{}) {
	l.Logger.Debug(args...)
}

func (l GrpcLogLogger) Infoln(args ...interface{}) {
	l.Logger.Debug(args...)
}

func (l GrpcLogLogger) Infof(format string, args ...interface{}) {
	l.Logger.Debugf(format, args...)
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
