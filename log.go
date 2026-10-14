package terminal

import (
	"github.com/btcsuite/btclog/v2"
	"github.com/lightninglabs/faraday"
	"github.com/lightninglabs/lightning-node-connect/gbn"
	"github.com/lightninglabs/lightning-node-connect/mailbox"
	"github.com/lightninglabs/lightning-terminal/accounts"
	"github.com/lightninglabs/lightning-terminal/autopilotserver"
	"github.com/lightninglabs/lightning-terminal/db"
	"github.com/lightninglabs/lightning-terminal/db/migsets"
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
	"github.com/lightningnetwork/lnd/sqldb/v2"
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

// SetupLoggers initializes all package-global logger variables. A critical log
// in one of litd's own subsystems shuts litd down via litdShutdown.
func SetupLoggers(root *build.SubLoggerManager, intercept signal.Interceptor,
	litdShutdown *shutdownSource) {

	interceptor = intercept

	genLogger := genSubLogger(root, litdShutdown)
	addSubLogger := func(subsystem string, useLogger func(btclog.Logger)) {
		logger := build.NewSubLogger(subsystem, genLogger)
		lnd.SetSubLogger(root, subsystem, logger, useLogger)
	}

	// Add the loggers of litd's own subsystems.
	addSubLogger(Subsystem, UseLogger)
	addSubLogger(session.Subsystem, session.UseLogger)
	addSubLogger(mailbox.Subsystem, mailbox.UseLogger)
	addSubLogger(gbn.Subsystem, gbn.UseLogger)
	addSubLogger(mid.Subsystem, mid.UseLogger)
	addSubLogger(accounts.Subsystem, accounts.UseLogger)
	addSubLogger(firewall.Subsystem, firewall.UseLogger)
	addSubLogger(firewalldb.Subsystem, firewalldb.UseLogger)
	addSubLogger(rules.Subsystem, rules.UseLogger)
	addSubLogger(autopilotserver.Subsystem, autopilotserver.UseLogger)
	addSubLogger(status.Subsystem, status.UseLogger)
	addSubLogger(subservers.Subsystem, subservers.UseLogger)
	addSubLogger(db.Subsystem, db.UseLogger)
	addSubLogger(sqldb.Subsystem, sqldb.UseLogger)
	addSubLogger(migsets.Subsystem, migsets.UseLogger)

	// Add daemon loggers to lnd's root logger.
	faraday.SetupLoggers(root, intercept)
	loopd.SetupLoggers(root, intercept)
	pool.SetupLoggers(root, intercept)
	tap.SetupLoggers(root, intercept)

	// Setup the gRPC loggers too.
	grpclog.SetLoggerV2(NewGrpcLogLogger(
		root, litdShutdown, GrpcLogSubsystem,
	))
}

// genSubLogger creates a logger for a subsystem. A critical log requests litd's
// shutdown, which in turn also stops lnd.
func genSubLogger(root *build.SubLoggerManager,
	litdShutdown *shutdownSource) func(string) btclog.Logger {

	return func(tag string) btclog.Logger {
		return root.GenSubLogger(tag, litdShutdown.RequestShutdown)
	}
}

// NewGrpcLogLogger creates a new grpclog compatible logger and attaches it as
// a sub logger to the passed root logger.
func NewGrpcLogLogger(root *build.SubLoggerManager,
	litdShutdown *shutdownSource, subsystem string) *GrpcLogLogger {

	logger := build.NewSubLogger(
		subsystem, genSubLogger(root, litdShutdown),
	)
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
