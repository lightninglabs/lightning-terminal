package subservers

// RemoteConfig holds the configuration parameters that are needed when running
// LiT in the "remote" lnd mode.
type RemoteConfig struct {
	LitLogDir         string `long:"lit-logdir" description:"For lnd remote mode only: Directory to log output."`
	LitMaxLogFiles    int    `long:"lit-maxlogfiles" description:"For lnd remote mode only: Maximum logfiles to keep (0 for no rotation)"`
	LitMaxLogFileSize int    `long:"lit-maxlogfilesize" description:"For lnd remote mode only: Maximum logfile size in MB"`

	LitDebugLevel string `long:"lit-debuglevel" description:"For lnd remote mode only: Logging level for all subsystems {trace, debug, info, warn, error, critical} -- You may also specify <subsystem>=<level>,<subsystem2>=<level>,... to set the log level for individual subsystems."`

	Lnd           *RemoteDaemonConfig `group:"Remote lnd (use when lnd-mode=remote)" namespace:"lnd"`
	Faraday       *RemoteDaemonConfig `group:"Remote faraday (use when faraday-mode=remote)" namespace:"faraday"`
	Loop          *RemoteDaemonConfig `group:"Remote loop (use when loop-mode=remote)" namespace:"loop"`
	Pool          *RemoteDaemonConfig `group:"Remote pool (use when pool-mode=remote)" namespace:"pool"`
	TaprootAssets *RemoteDaemonConfig `group:"Remote taproot-assets (use when taproot-assets-mode=remote)" namespace:"taproot-assets"`
}

// RemoteDaemonConfig holds the configuration parameters that are needed to
// connect to a remote daemon like lnd for example.
type RemoteDaemonConfig struct {
	// RPCServer is host:port that the remote daemon's RPC server is
	// listening on.
	RPCServer string `long:"rpcserver" description:"The host:port that the remote daemon is listening for RPC connections on."`

	// MacaroonPath is the path to the single macaroon that should be used
	// instead of needing to specify the macaroon directory that contains
	// all of the daemon's macaroons. The specified macaroon MUST have all
	// permissions that all the subservers use, otherwise permission errors
	// will occur.
	MacaroonPath string `long:"macaroonpath" description:"The full path to the single macaroon to use, either the main (admin.macaroon in lnd's case) or a custom baked one. A custom macaroon must contain ALL permissions required for all subservers to work, otherwise permission errors will occur."`

	// TLSCertPath is the path to the tls cert of the remote daemon that
	// should be used to verify the TLS identity of the remote RPC server.
	TLSCertPath string `long:"tlscertpath" description:"The full path to the remote daemon's TLS cert to use for RPC connection verification."`
}
