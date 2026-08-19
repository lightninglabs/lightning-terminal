package terminal

import (
	"github.com/coreos/go-systemd/v22/daemon"
)

// notifySystemdReady notifies systemd that litd has finished starting up and is
// ready to serve requests, so a unit using Type=notify can leave the
// "activating" state. If litd is not running under systemd (NOTIFY_SOCKET is
// unset) the call is a no-op. A failure is only logged: litd is already up, so
// it keeps running regardless.
func notifySystemdReady() {
	notified, err := daemon.SdNotify(false, daemon.SdNotifyReady)
	if err != nil {
		log.Errorf("Failed to notify systemd of readiness: %v (if you "+
			"are not running under systemd, clear the "+
			"NOTIFY_SOCKET environment variable)", err)

		return
	}

	if notified {
		log.Infof("Notified systemd that litd is ready")
	} else {
		log.Debugf("Not running under a systemd Type=notify unit; " +
			"skipped the readiness notification")
	}
}

// notifySystemdStopping notifies systemd that litd is shutting down. It is
// best-effort: any error is logged and ignored, since litd is stopping anyway.
func notifySystemdStopping() {
	_, err := daemon.SdNotify(false, daemon.SdNotifyStopping)
	if err != nil {
		log.Errorf("Failed to notify systemd of shutdown: %v", err)
	}
}
