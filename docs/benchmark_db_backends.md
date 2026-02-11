# Benchmarking LiT Database Backends

This document describes how to run LiT benchmarks to compare the kvdb
(bbolt) backend against the SQL backends (sqlite and postgres).

## Benchmarks Included

The benchmark suite currently covers these stores:

- `accounts`: account CRUD and payment/invoice updates.

## Running Benchmarks

Benchmarks are wired into the standard test framework. Use the
`unit-bench` target with `pkg` to scope the benchmark. Each run executes
all supported backends in that package (kvdb-bbolt and native-sqlite).

### kvdb (bbolt) + sqlite (single run)

```bash
make unit-bench pkg=accounts
```

### postgres (optional)

Postgres benchmarks use the test fixture in `sqldb`. This requires Docker.
Enable them explicitly, by manually setting the `benchPostgres` boolean to true
in the respective test.

## Comparing Results

For more stable results, run benchmarks multiple times and compare with
`benchstat`. Because the benchmark names include the backend (for example,
`BenchmarkAccountStore/kvdb-bbolt/...` and
`BenchmarkAccountStore/native-sqlite/...`), you need to normalize the names
before comparing.

One simple approach is to run once, split the output into two files, and
normalize the names so `benchstat` can compare like-for-like:

```bash
GOFLAGS='-count=10' make unit-bench pkg=accounts > /tmp/run.txt

grep '^BenchmarkAccountStore/kvdb-bbolt/' /tmp/run.txt | \
  sed 's#BenchmarkAccountStore/kvdb-bbolt/#BenchmarkAccountStore/#' \
  > /tmp/kvdb.norm.txt
grep '^BenchmarkAccountStore/native-sqlite/' /tmp/run.txt | \
  sed 's#BenchmarkAccountStore/native-sqlite/#BenchmarkAccountStore/#' \
  > /tmp/sqlite.norm.txt

benchstat /tmp/kvdb.norm.txt /tmp/sqlite.norm.txt
```
