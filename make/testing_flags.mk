include make/compile_flags.mk

ITEST_FLAGS =
TEST_FLAGS =

# Define the integration test.run filter if the icase argument was provided.
ifneq ($(icase),)
ITEST_FLAGS += -test.run="TestLightningTerminal/$(icase)"
endif

# If a specific unit test case is being targeted, construct test.run filter.
ifneq ($(case),)
TEST_FLAGS += -test.run=$(case)
endif

UNIT := $(GOLIST) | $(XARGS) env $(GOTEST) -tags="$(COMPILE_TAGS)" $(TEST_FLAGS)
UNIT_RACE := $(UNIT) -race