include make/compile_flags.mk

TEST_FLAGS =
DEV_TAGS = dev

NUM_ITEST_TRANCHES = 8
ITEST_PARALLELISM = $(NUM_ITEST_TRANCHES)
SHUFFLE_SEED = 0

# Scale the number of parallel running itest tranches.
ifneq ($(tranches),)
NUM_ITEST_TRANCHES = $(tranches)
ITEST_PARALLELISM = $(NUM_ITEST_TRANCHES)
endif

# Give the ability to run the same tranche multiple times at the same time.
ifneq ($(parallel),)
ITEST_PARALLELISM = $(parallel)
endif

# Set the seed for shuffling the test cases.
ifneq ($(shuffleseed),)
SHUFFLE_SEED = $(shuffleseed)
endif

# Define the integration test.run filter if the icase argument was provided.
ifneq ($(icase),)
ITEST_FLAGS += -test.run="TestLightningTerminal/tranche.*/.*-of-.*/$(icase)"
endif

# Run itests with specified db backend.
ifneq ($(dbbackend),)
ITEST_FLAGS += -litdbbackend=$(dbbackend)
endif

# If a specific unit test case is being targeted, construct test.run filter.
ifneq ($(case),)
TEST_FLAGS += -test.run=$(case)
UNIT_TARGETED = yes
endif

# If specific package is being unit tested, construct the full name of the
# subpackage.
ifneq ($(pkg),)
UNITPKG := $(PKG)/$(pkg)
COVER_PKG := $(PKG)/$(pkg)
UNIT_TARGETED = yes
GOLIST = echo '$(PKG)/$(pkg)'
endif

# Add the build tag for running unit tests against a postgres DB.
ifeq ($(dbbackend),postgres)
DEV_TAGS += test_db_postgres
endif

# Add the build tag for running unit tests against a sqlite DB.
ifeq ($(dbbackend),sqlite)
DEV_TAGS += test_db_sqlite
endif

# Add any additional tags that are passed in to make.
ifneq ($(tags),)
DEV_TAGS += ${tags}
endif

# UNIT_TARGETED is undefined iff a specific package and/or unit test case is
# not being targeted.
UNIT_TARGETED ?= no

# If a specific package/test case was requested, run the unit test for the
# targeted case. Otherwise, default to running all tests.
ifeq ($(UNIT_TARGETED), yes)
UNIT := $(GOTEST) -tags="$(DEV_TAGS) $(COMPILE_TAGS)" $(TEST_FLAGS) $(UNITPKG)
UNIT_DEBUG := $(GOTEST) -v -tags="$(DEV_TAGS) $(COMPILE_TAGS)" $(TEST_FLAGS) $(UNITPKG)
endif

ifeq ($(UNIT_TARGETED), no)
UNIT := $(GOLIST) | $(XARGS) env $(GOTEST) -tags="$(DEV_TAGS) $(COMPILE_TAGS)" $(TEST_FLAGS)
UNIT_DEBUG := $(GOLIST) | $(XARGS) env $(GOTEST) -v -tags="$(DEV_TAGS) $(COMPILE_TAGS)" $(TEST_FLAGS)
endif

UNIT_RACE := $(UNIT) -race
