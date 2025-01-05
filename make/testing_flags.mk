include make/compile_flags.mk

ITEST_FLAGS =

# Define the integration test.run filter if the icase argument was provided.
ifneq ($(icase),)
ITEST_FLAGS += -test.run="TestLightningTerminal/$(icase)"
endif

UNIT := $(GOLIST) | $(XARGS) env $(GOTEST) -tags="$(COMPILE_TAGS)"
UNIT_RACE := $(UNIT) -race