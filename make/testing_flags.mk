include make/compile_flags.mk

ITEST_FLAGS =
TEST_FLAGS =
DEV_TAGS = dev

# Define the integration test.run filter if the icase argument was provided.
ifneq ($(icase),)
ITEST_FLAGS += -test.run="TestLightningTerminal/$(icase)"
endif

# If a specific unit test case is being targeted, construct test.run filter.
ifneq ($(case),)
TEST_FLAGS += -test.run=$(case)
endif

# Add any additional tags that are passed in to make.
ifneq ($(tags),)
DEV_TAGS += ${tags}
endif

UNIT := $(GOLIST) | $(XARGS) env $(GOTEST) -tags="$(DEV_TAGS) $(COMPILE_TAGS)" $(TEST_FLAGS)
UNIT_RACE := $(UNIT) -race