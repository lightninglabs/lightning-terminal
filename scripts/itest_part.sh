#!/bin/bash

# Let's work with absolute paths only, we run in the itest directory itself.
WORKDIR=$(pwd)/itest

TRANCHE=0
NUM_TRANCHES=1
SHUFFLE_SEED=0

# If the first three arguments are integers, treat them as tranche settings.
if [[ $# -ge 3 && "$1" =~ ^[0-9]+$ && "$2" =~ ^[0-9]+$ && "$3" =~ ^[0-9]+$ ]]; then
	TRANCHE=$1
	NUM_TRANCHES=$2
	SHUFFLE_SEED=$3
	shift 3
fi

# Windows insists on having the .exe suffix for an executable, we need to add
# that here if necessary.
EXEC="$WORKDIR"/itest.test
LITD_EXEC="$WORKDIR"/litd-itest
BTCD_EXEC="$WORKDIR"/btcd-itest
LOG_DIR="$WORKDIR/.logs"
if [[ $NUM_TRANCHES -gt 1 ]]; then
	LOG_DIR="$WORKDIR/.logs/tranche$TRANCHE"
fi

mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/output.log"

TRANCHE_FLAGS=(-splittranches="$NUM_TRANCHES" -runtranche="$TRANCHE" -shuffleseed="$SHUFFLE_SEED")

echo "$EXEC" -test.v "${TRANCHE_FLAGS[@]}" "$@" -logoutput -logdir="$LOG_DIR" -litdexec=$LITD_EXEC -btcdexec=$BTCD_EXEC

# Exit code 255 causes the parallel jobs to abort, so if one part fails the
# other is aborted too.
cd "$WORKDIR" || exit 255
$EXEC -test.v "${TRANCHE_FLAGS[@]}" "$@" -logoutput -logdir="$LOG_DIR" -litdexec=$LITD_EXEC -btcdexec=$BTCD_EXEC >"$LOG_FILE" 2>&1

exit_code=$?
if [ $exit_code -ne 0 ]; then
	echo "Tranche $TRANCHE failed with exit code $exit_code"
	tail -n 100 "$LOG_FILE"
	exit 255
else
	echo "Tranche $TRANCHE completed successfully"
fi
