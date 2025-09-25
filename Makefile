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
DIRTY := $(shell git diff-index --quiet HEAD -- || echo -dirty)
PUBLIC_URL := 

# GO_VERSION is the Go version used for the release build, docker files, and
# GitHub Actions. This is the reference version for the project. All other Go
# versions are checked against this version.
GO_VERSION = 1.24.6

# LITD_COMPAT_VERSIONS is a space-separated list of litd versions that are
# installed before running the integration tests which include backward
# compatibility tests. The list of versions must be in sync with any version
# used in the backwardCompat map in itest/litd_test_list_on_test.go.
LITD_COMPAT_VERSIONS = v0.14.1-alpha v0.15.0-alpha

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
	-X $(PKG).CommitHash=$(COMMIT_HASH) \
	-X $(PKG).Dirty=$(DIRTY) \
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

DOCKER_TOOLS = docker run \
  -v $(shell bash -c "go env GOCACHE || (mkdir -p /tmp/go-cache; echo /tmp/go-cache)"):/tmp/build/.cache \
  -v $(shell bash -c "go env GOMODCACHE || (mkdir -p /tmp/go-modcache; echo /tmp/go-modcache)"):/tmp/build/.modcache \
  -v $(shell bash -c "mkdir -p /tmp/go-lint-cache; echo /tmp/go-lint-cache"):/root/.cache/golangci-lint \
  -v $$(pwd):/build litd-tools

ITEST_TAGS := dev integration itest lowscrypt $(LND_RELEASE_TAGS)
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


go-build-noui:
	@$(call print, "Building lightning-terminal without UI.")
	$(GOBUILD) -tags="litd_no_ui $(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" -o litd-debug $(PKG)/cmd/litd
	$(GOBUILD) -tags="litd_no_ui $(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" -o litcli-debug $(PKG)/cmd/litcli

go-install:
	@$(call print, "Installing lightning-terminal.")
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litd
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

go-install-noui:
	@$(call print, "Installing lightning-terminal without UI.")
	$(GOINSTALL) -tags="litd_no_ui $(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litd
	$(GOINSTALL) -tags="litd_no_ui $(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

go-install-cli-nolit:
	@$(call print, "Installing all CLI binaries.")
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" github.com/lightningnetwork/lnd/cmd/lncli
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/loop/cmd/loop
	$(GOINSTALL) -trimpath github.com/lightninglabs/faraday/cmd/frcli
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/pool/cmd/pool
	$(GOINSTALL) -trimpath -ldflags "$(LDFLAGS)" github.com/lightninglabs/taproot-assets/cmd/tapcli

go-install-cli: go-install-cli-nolit
	@$(call print, "Installing litcli binary.")
	$(GOINSTALL) -trimpath -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

go-install-cli-noui: go-install-cli-nolit
	@$(call print, "Installing litcli binary without UI.")
	$(GOINSTALL) -trimpath -tags="litd_no_ui $(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/litcli

app-build: yarn-install
	@$(call print, "Building production app.")
	cd app; yarn build

docker-app-build:
	@$(call print, "Building production app in docker.")
	cd app; ./gen_app_docker.sh

release: docker-app-build go-release

go-release:
	@$(call print, "Creating release of lightning-terminal.")
	./scripts/release.sh build-release "$(VERSION_TAG)" "$(BUILD_SYSTEM)" "$(LND_RELEASE_TAGS)" "$(RELEASE_LDFLAGS)" "$(GO_VERSION)"

docker-release: docker-app-build
	@$(call print, "Building release helper docker image.")
	if [ "$(tag)" = "" ]; then echo "Must specify tag=<commit_or_tag>!"; exit 1; fi

	docker build -t litd-release-helper -f make/builder.Dockerfile make/

	# Run the actual compilation inside the docker image. We pass in all flags
	# that we might want to overwrite in manual tests.
	$(DOCKER_RELEASE_HELPER) make go-release tag="$(tag)" sys="$(sys)" COMMIT="$(COMMIT)" 

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
	$(UNIT)

#? unit-debug: Run unit tests with debug log output enabled
unit-debug:
	@$(call print, "Running unit tests.")
	mkdir -p app/build && touch app/build/index.html
	$(UNIT_DEBUG)

unit-cover: $(GOACC_BIN)
	@$(call print, "Running unit coverage tests.")
	$(GOACC_BIN) $(COVER_PKG)

unit-race:
	@$(call print, "Running unit race tests.")
	mkdir -p app/build && touch app/build/index.html
	env CGO_ENABLED=1 GORACE="history_size=7 halt_on_errors=1" $(UNIT_RACE)

clean-itest:
	@$(call print, "Cleaning itest binaries.")
	rm -rf itest/litd-itest itest/btcd-itest itest/lnd-itest

build-itest:
	@$(call print, "Building itest binaries.")
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/litd-itest -ldflags "$(ITEST_LDFLAGS)" $(PKG)/cmd/litd
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/btcd-itest -ldflags "$(ITEST_LDFLAGS)" $(BTCD_PKG)
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/lnd-itest -ldflags "$(ITEST_LDFLAGS)" $(LND_PKG)/cmd/lnd

install-backward-compat-versions:
	@$(call print, "Installing old versions of litd for backward compatibility tests.")
	scripts/install-backward-compat-versions.sh '$(LITD_COMPAT_VERSIONS)'

run-itest-only:
	@$(call print, "Building itest binary.")
	CGO_ENABLED=0 $(GOBUILD) -tags="$(ITEST_TAGS)" -o itest/litd-itest -ldflags "$(ITEST_LDFLAGS)" $(PKG)/cmd/litd
	CGO_ENABLED=0 $(GOTEST) -v ./itest -tags="$(DEV_TAGS) $(ITEST_TAGS)" -c -o itest/itest.test

	@$(call print, "Running integration tests.")
	rm -rf itest/*.log itest/.logs*; date
	scripts/itest_part.sh $(ITEST_FLAGS)

itest-only: build-itest install-backward-compat-versions run-itest-only

itest: app-build build-itest itest-only

itest-no-backward-compat: app-build build-itest build-itest run-itest-only

# =============
# FLAKE HUNTING
# =============
flake-unit:
	@$(call print, "Flake hunting unit tests.")
	while [ $$? -eq 0 ]; do GOTRACEBACK=all $(UNIT) -count=1; done

flake-itest-only:
	@$(call print, "Flake hunting integration tests.")
	while [ $$? -eq 0 ]; do make itest-only icase='${icase}'; done

# =========
# UTILITIES
# =========
fmt: $(GOIMPORTS_BIN)
	@$(call print, "Fixing imports.")
	gosimports -w $(GOFILES_NOVENDOR)
	@$(call print, "Formatting source.")
	gofmt -l -w -s $(GOFILES_NOVENDOR)

check-go-version-yaml:
	@$(call print, "Checking for target Go version (v$(GO_VERSION)) in YAML files (*.yaml, *.yml)")
	./scripts/check-go-version-yaml.sh $(GO_VERSION)

check-go-version-dockerfile:
	@$(call print, "Checking for target Go version (v$(GO_VERSION)) in Dockerfile files (*Dockerfile)")
	./scripts/check-go-version-dockerfile.sh $(GO_VERSION)

check-go-version: check-go-version-dockerfile check-go-version-yaml

lint: check-go-version docker-tools
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

clean: clean-itest
	@$(call print, "Cleaning source.$(NC)")
	$(RM) ./litcli-debug
	$(RM) ./litd-debug
	$(RM) coverage.txt
	$(RM) -r ./vendor

sqlc:
	@$(call print, "Generating sql models and queries in Go")
	./scripts/gen_sqlc_docker.sh

sqlc-check: sqlc
	@$(call print, "Verifying sql code generation.")
	if test -n "$$(git status --porcelain '*.go')"; then echo "SQL models not properly generated!"; git status --porcelain '*.go'; exit 1; fi

#? flakehunter-unit: Run the unit tests continuously until one fails
flakehunter-unit:
	@$(call print, "Flake hunting unit test.")
	scripts/unit-test-flake-hunter.sh ${pkg} ${case}

# Prevent make from interpreting any of the defined goals as folders or files to
# include in the build process.
.PHONY: default all yarn-install build install go-build go-build-noui \
	go-install go-install-noui go-install-cli app-build release go-release \
	docker-release docker-tools scratch check unit unit-cover unit-race \
	clean-itest build-itest itest-only itest flake-unit fmt lint mod mod-check \
	list rpc protos protos-check rpc-js-compile clean