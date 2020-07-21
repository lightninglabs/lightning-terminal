PKG := github.com/lightninglabs/lightning-terminal
ESCPKG := github.com\/lightninglabs\/lightning-terminal
LND_PKG := github.com/lightningnetwork/lnd

LINT_PKG := github.com/golangci/golangci-lint/cmd/golangci-lint
GOVERALLS_PKG := github.com/mattn/goveralls
GOACC_PKG := github.com/ory/go-acc
STATIK_PKG := github.com/rakyll/statik

GO_BIN := ${GOPATH}/bin
GOVERALLS_BIN := $(GO_BIN)/goveralls
LINT_BIN := $(GO_BIN)/golangci-lint
GOACC_BIN := $(GO_BIN)/go-acc
STATIK_BIN := $(GO_BIN)/statik

COMMIT := $(shell git describe --abbrev=40 --dirty --tags)
COMMIT_HASH := $(shell git rev-parse HEAD)

LINT_COMMIT := v1.18.0
GOACC_COMMIT := ddc355013f90fea78d83d3a6c71f1d37ac07ecd5

DEPGET := cd /tmp && GO111MODULE=on go get -v
GOBUILD := GO111MODULE=on go build -v
GOINSTALL := GO111MODULE=on go install -v
GOTEST := GO111MODULE=on go test -v
GOMOD := GO111MODULE=on go mod

GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*")
GOLIST := go list -deps $(PKG)/... | grep '$(PKG)'| grep -v '/vendor/'
GOLISTCOVER := $(shell go list -deps -f '{{.ImportPath}}' ./... | grep '$(PKG)' | sed -e 's/^$(ESCPKG)/./')

RM := rm -f
CP := cp
MAKE := make
XARGS := xargs -L 1

LINT = $(LINT_BIN) run -v

include make/release_flags.mk

# We only return the part inside the double quote here to avoid escape issues
# when calling the external release script. The second parameter can be used to
# add additional ldflags if needed (currently only used for the release).
make_ldflags = $(2) -X $(LND_PKG)/build.Commit=lightning-terminal-$(COMMIT) \
	-X $(LND_PKG)/build.CommitHash=$(COMMIT_HASH) \
	-X $(LND_PKG)/build.GoVersion=$(GOVERSION) \
	-X $(LND_PKG)/build.RawTags=$(shell echo $(1) | sed -e 's/ /,/g')

LDFLAGS := $(call make_ldflags, $(LND_RELEASE_TAGS))

# For the release, we want to remove the symbol table and debug information (-s)
# and omit the DWARF symbol table (-w). Also we clear the build ID.
RELEASE_LDFLAGS := $(call make_ldflags, $(LND_RELEASE_TAGS), -s -w -buildid=)

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

$(GOVERALLS_BIN):
	@$(call print, "Fetching goveralls.")
	go get -u $(GOVERALLS_PKG)

$(LINT_BIN):
	@$(call print, "Fetching linter")
	$(DEPGET) $(LINT_PKG)@$(LINT_COMMIT)

$(GOACC_BIN):
	@$(call print, "Fetching go-acc")
	$(DEPGET) $(GOACC_PKG)@$(GOACC_COMMIT)

$(STATIK_BIN):
	@$(call print, "Fetching statik")
	$(DEPGET) $(STATIK_PKG)

yarn-install:
	@$(call print, "Installing app dependencies with yarn")
	cd app; yarn

# ============
# INSTALLATION
# ============
statik-build: $(STATIK_BIN) app-build
	@$(call print, "Building statik package.")
	statik -src=app/build

build: statik-build go-build
install: statik-build go-install

go-build:
	@$(call print, "Building lightning-terminal.")
	$(GOBUILD) -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" -o lightning-terminal-debug $(PKG)/cmd/lightning-terminal

go-install:
	@$(call print, "Installing lightning-terminal.")
	$(GOINSTALL) -tags="$(LND_RELEASE_TAGS)" -ldflags "$(LDFLAGS)" $(PKG)/cmd/lightning-terminal

app-build: yarn-install
	@$(call print, "Building production app.")
	cd app; yarn build

release: statik-build
	@$(call print, "Creating release of lightning-terminal.")
	./release.sh build-release "$(VERSION_TAG)" "$(BUILD_SYSTEM)" "$(LND_RELEASE_TAGS)" "$(RELEASE_LDFLAGS)"

scratch: build

# =======
# TESTING
# =======

check: unit

unit:
	@$(call print, "Running unit tests.")
	$(UNIT)

unit-cover: $(GOACC_BIN)
	@$(call print, "Running unit coverage tests.")
	$(GOACC_BIN) $(COVER_PKG)

unit-race:
	@$(call print, "Running unit race tests.")
	env CGO_ENABLED=1 GORACE="history_size=7 halt_on_errors=1" $(UNIT_RACE)

goveralls: $(GOVERALLS_BIN)
	@$(call print, "Sending coverage report.")
	$(GOVERALLS_BIN) -coverprofile=coverage.txt -service=travis-ci

travis-race: lint unit-race

travis-cover: lint unit-cover goveralls

travis-itest: lint


# =============
# FLAKE HUNTING
# =============
flake-unit:
	@$(call print, "Flake hunting unit tests.")
	while [ $$? -eq 0 ]; do GOTRACEBACK=all $(UNIT) -count=1; done

# =========
# UTILITIES
# =========
fmt:
	@$(call print, "Formatting source.")
	gofmt -l -w -s $(GOFILES_NOVENDOR)

lint: $(LINT_BIN)
	@$(call print, "Linting source.")
	$(LINT)

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

clean:
	@$(call print, "Cleaning source.$(NC)")
	$(RM) ./lightning-terminal-debug
	$(RM) coverage.txt
	$(RM) -r statik
