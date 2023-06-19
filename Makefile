PKG := github.com/lightninglabs/lightning-terminal
ESCPKG := github.com\/lightninglabs\/lightning-terminal
LND_PKG := github.com/lightningnetwork/lnd
LOOP_PKG := github.com/lightninglabs/loop
POOL_PKG := github.com/lightninglabs/pool
TAP_PKG := github.com/lightninglabs/taproot-assets
BTCD_PKG := github.com/btcsuite/btcd

GOACC_PKG := github.com/ory/go-acc
GOIMPORTS_PKG := github.com/rinchsan/gosimports/cmd/gosimports
TOOLS_DIR := tools

GO_BIN := ${GOPATH}/bin
GOACC_BIN := $(GO_BIN)/go-acc
GOIMPORTS_BIN := $(GO_BIN)/gosimports

COMMIT := $(shell git describe --abbrev=40 --dirty --tags)
COMMIT_HASH := $(shell git rev-parse HEAD)
PUBLIC_URL := 

LOOP_COMMIT := $(shell cat go.mod | \
		grep $(LOOP_PKG) | \
		head -n1 | \
		awk -F " " '{ print $$2 }' | \
		awk -F "/" '{ print $$1 }')

POOL_COMMIT := $(shell cat go.mod | \
		grep $(POOL_PKG) | \
		head -n1 | \
		awk -F " " '{ print $$2 }' | \
		awk -F "/" '{ print $$1 }')

TAP_COMMIT := $(shell cat go.mod | \
		grep $(TAP_PKG) | \
		head -n1 | \
		awk -F " " '{ print $$2 }' | \
		awk -F "/" '{ print $$1 }')

GOBUILD := go build -v
GOINSTALL := go install -v
GOTEST := go test -v
GOMOD := go mod

GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*" -not -name "*pb.go" -not -name "*pb.gw.go" -not -name "*.pb.json.go")
GOLIST := go list -deps $(PKG)/... | grep '$(PKG)'| grep -v '/vendor/'
GOLISTCOVER := $(shell go list -deps -f '{{.ImportPath}}' ./... | grep '$(PKG)' | sed -e 's/^$(ESCPKG)/./')

RM := rm -f
CP := cp
MAKE := make
XARGS := xargs -L 1

LINT = $(LINT_BIN) run -v

UNIT := $(GOLIST) | $(XARGS) env $(GOTEST)
UNIT_RACE := $(UNIT) -race

include make/release_flags.mk
include make/testing_flags.mk

# We only return the part inside the double quote here to avoid escape issues
# when calling the external release script. The second parameter can be used to
# add additional ldflags if needed (currently only used for the release).
make_ldflags = $(2) -X $(LND_PKG)/build.Commit=lightning-terminal-$(COMMIT) \
	-X $(LND_PKG)/build.CommitHash=$(COMMIT_HASH) \
	-X $(LND_PKG)/build.GoVersion=$(GOVERSION) \
	-X $(LND_PKG)/build.RawTags=$(shell echo $(1) | sed -e 's/ /,/g') \
	-X $(PKG).appFilesPrefix=$(PUBLIC_URL) \
	-X $(PKG).Commit=$(COMMIT) \
	-X $(LOOP_PKG).Commit=$(LOOP_COMMIT) \
	-X $(POOL_PKG).Commit=$(POOL_COMMIT) \
	-X $(TAP_PKG).Commit=$(TAP_COMMIT)

LDFLAGS := $(call make_ldflags, $(LND_RELEASE_TAGS))

# For the release, we want to remove the symbol table and debug information (-s)
# and omit the DWARF symbol table (-w). Also we clear the build ID.
RELEASE_LDFLAGS := $(call make_ldflags, $(LND_RELEASE_TAGS), -s -w -buildid=)

# Linting uses a lot of memory, so keep it under control by limiting the number
# of workers if requested.
ifneq ($(workers),)
LINT_WORKERS = --concurrency=$(workers)
endif

DOCKER_TOOLS = docker run -v $$(pwd):/build litd-tools

ITEST_TAGS := integration itest $(LND_RELEASE_TAGS)
ITEST_LDFLAGS := $(call make_ldflags, $(ITEST_TAGS))

GREEN := "\\033[0;32m"
NC := "\\033[0m"
define print
	echo $(GREEN)$1$(NC)
endef

default: scratch

all: scratch check install

# ============
# DEPENDENCIES
# ============

$(GOACC_BIN):
	@$(call print, "Installing go-acc.")
	cd $(TOOLS_DIR); go install -trimpath $(GOACC_PKG)

$(GOIMPORTS_BIN):
	@$(call print, "Installing goimports.")
	cd $(TOOLS_DIR); go install -trimpath $(GOIMPORTS_PKG)

yarn-install:
	@$(call print, "Installing app dependencies with yarn")
	cd app; yarn

# ============
# INSTALLATION
# ============

build: app-build go-build
install: app-build go-install

go-build:
	@$(call print, "Building lightning-terminal.")
	$(GOBUILD) -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" -o litd-debug $(PKG)/cmd/litd
	$(GOBUILD) -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" -o litcli-debug $(PKG)/cmd/litcli

go-install:
	@$(call print, "Installing lightning-terminal.")
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litd
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

go-install-cli:
	@$(call print, "Installing all CLI binaries.")
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" github.com/lightningnetwork/lnd/cmd/lncli
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/loop/cmd/loop
	$(GOINSTALL) -trimpath github.com/lightninglabs/faraday/cmd/frcli
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/pool/cmd/pool
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/taproot-assets/cmd/tapcli
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

app-build: yarn-install
	@$(call print, "Building production app.")
	cd app; yarn build

release: app-build
	@$(call print, "Creating release of lightning-terminal.")
	./release.sh build-release "$(VERSION_TAG)" "$(BUILD_SYSTEM)" "$(LND_RELEASE_TAGS)" "$(RELEASE_LDFLAGS)"

docker-tools:
	@$(call print, "Building tools docker image.")
	docker build -q -t litd-tools $(TOOLS_DIR)

scratch: build

# =======
# TESTING
# =======

check: unit

unit:
	@$(call print, "Running unit tests.")
	mkdir -p app/build && touch app/build/index.html
	$(UNIT) -tags="$(LND_RELEASE_TAGS)"

unit-cover: $(GOACC_BIN)
	@$(call print, "Running unit coverage tests.")
	$(GOACC_BIN) $(COVER_PKG)

unit-race:
	@$(call print, "Running unit race tests.")
	mkdir -p app/build && touch app/build/index.html
	env CGO_ENABLED=1 GORACE="history_size=7 halt_on_errors=1" $(UNIT_RACE) -tags="$(LND_RELEASE_TAGS)"

build-itest: app-build
	@$(call print, "Building itest btcd and litd.")
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/btcd-itest -ldflags "$(ITEST_LDFLAGS)" $(BTCD_PKG)
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/lnd-itest -ldflags "$(ITEST_LDFLAGS)" $(LND_PKG)/cmd/lnd

itest-only:
	@$(call print, "Building itest binary.")
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/litd-itest -ldflags "$(ITEST_LDFLAGS)" $(PKG)/cmd/litd
	CGO_ENABLED=0 $(GOTEST) -v ./itest -tags="$(DEV_TAGS) $(ITEST_TAGS)" -c -o itest/itest.test

	@$(call print, "Running integration tests.")
	rm -rf itest/*.log itest/.logs*; date
	scripts/itest_part.sh $(ITEST_FLAGS)

itest: build-itest itest-only

# =============
# FLAKE HUNTING
# =============
flake-unit:
	@$(call print, "Flake hunting unit tests.")
	while [ $$? -eq 0 ]; do GOTRACEBACK=all $(UNIT) -count=1; done

# =========
# UTILITIES
# =========
fmt: $(GOIMPORTS_BIN)
	@$(call print, "Fixing imports.")
	gosimports -w $(GOFILES_NOVENDOR)
	@$(call print, "Formatting source.")
	gofmt -l -w -s $(GOFILES_NOVENDOR)

lint: docker-tools
	@$(call print, "Linting source.")
	$(DOCKER_TOOLS) golangci-lint run -v $(LINT_WORKERS)

mod:
	@$(call print, "Tidying modules.")
	$(GOMOD) tidy

mod-check:
	@$(call print, "Checking modules.")
	$(GOMOD) tidy
	if test -n "$$(git status | grep -e "go.mod\|go.sum")"; then echo "Running go mod tidy changes go.mod/go.sum"; git status; git diff; exit 1; fi

list:
	@$(call print, "Listing commands.")
	@$(MAKE)  -qp | \
		awk -F':' '/^[a-zA-Z0-9][^$$#\/\t=]*:([^=]|$$)/ {split($$1,A,/ /);for(i in A)print A[i]}' | \
		grep -v Makefile | \
		sort

rpc:
	@$(call print, "Compiling protos.")
	cd ./litrpc; ./gen_protos_docker.sh

protos:
	@$(call print, "Compiling protos.")
	cd proto; ./gen_protos_docker.sh

protos-check: protos
	@$(call print, "Verifying compiled protos.")
	if test -n "$$(git describe --dirty | grep dirty)"; then echo "Protos not properly formatted or not compiled with correct version"; git status; git diff; exit 1; fi

rpc-js-compile:
	@$(call print, "Compiling JSON/WASM stubs.")
	GOOS=js GOARCH=wasm $(GOBUILD) $(PKG)/litrpc

clean:
	@$(call print, "Cleaning source.$(NC)")
	$(RM) ./litcli-debug
	$(RM) ./litd-debug
	$(RM) coverage.txt
