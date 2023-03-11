ITEST_FLAGS = 

# Define the integration test.run filter if the icase argument was provided.
ifneq ($(icase),)
ITEST_FLAGS += -test.run="TestLightningTerminal/$(icase)"
endif
