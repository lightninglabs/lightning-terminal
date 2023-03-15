#!/bin/bash

# Let's work with absolute paths only, we run in the itest directory itself.
WORKDIR=$(pwd)/itest

# Windows insists on having the .exe suffix for an executable, we need to add
# that here if necessary.
EXEC="$WORKDIR"/itest.test
LITD_EXEC="$WORKDIR"/litd-itest
BTCD_EXEC="$WORKDIR"/btcd-itest
echo $EXEC -test.v "$@" -logoutput -logdir=.logs -litdexec=$LITD_EXEC -btcdexec=$BTCD_EXEC

# Exit code 255 causes the parallel jobs to abort, so if one part fails the
# other is aborted too.
cd "$WORKDIR" || exit 255
$EXEC -test.v "$@" -logoutput -logdir=.logs -litdexec=$LITD_EXEC -btcdexec=$BTCD_EXEC || exit 255
