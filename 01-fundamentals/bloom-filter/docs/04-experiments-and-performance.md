# Experiments and Performance Analysis

## Experiment objectives

The existing scale test checks that the in-memory Bloom Filter can insert a synthetic set, reports bitmap occupancy, measures lookup work, and estimates false positives against values not inserted. It is a behavior and data-structure experiment, not a service-level benchmark.

## Initial configuration

| Parameter | Value |
|---|---:|
| Expected usernames | 100,000 |
| Target false-positive rate | 1% |
| Bit-array size | 958,506 bits |
| Hash positions per username | 7 |
| Approximate raw bitmap memory | 117 KiB |

## Scale test results

The later run recorded in the project task notes is shown as the primary measurement:

| Metric | Recorded result |
|---|---:|
| Insertion time | 458.676 ms |
| Expected items | 100,000 |
| Total set bits | 496,440 |
| Bit-array utilization | 51.79% |
| Lookup time for 10,000 absent candidates | 71.912 ms |
| False positives | 105 / 10,000 |
| Observed false-positive rate | 1.05% |

The repository's checked-in [historical scale experiment](scale-experiment.md) records an earlier run: 421.611 ms insertion, 496,747 set bits (51.83%), 68.041 ms for 10,000 lookups, and 101 false positives (1.01%). Results are retained as local observations, not expected timings.

The checked-in script is `backend/src/bloom-filter/experiments/scale-test.ts`. Run it from `backend/` with:

```bash
npx ts-node src/bloom-filter/experiments/scale-test.ts
```

## Theoretical and observed behavior

The configured target is 1%; the recorded later run observed 1.05%. A finite sample of 10,000 absent candidates will vary between runs, and theoretical estimates assume idealized hash behavior. The implementation uses SHA-256 based double hashing, and these local observations do not establish a guaranteed production false-positive rate.

## Memory utilization

The test counts set bits and divides by the configured 958,506 bit positions. Around 51.8% occupancy is expected for 100,000 insertions with seven positions per insertion:

```text
occupancy ≈ 1 - (1 - 1/m)^(kn) ≈ 1 - e^(-kn/m)
```

With `m = 958,506`, `k = 7`, and `n = 100,000`, this is approximately 51.8%. Since bits only change from zero to one, occupancy grows with inserted elements; higher occupancy generally means more false positives.

## What these measurements show

They show the behavior of the standalone in-memory `BloomFilter` for this synthetic input size and environment. The benchmark calculates Bloom positions and bits inside one Node process. It does not use Redis, PostgreSQL, network requests, NestJS endpoints, or production traffic.

Therefore it does **not** demonstrate that Redis-backed lookups outperform PostgreSQL lookups. Establishing that requires a controlled end-to-end comparison that includes database indexes, network latency, workload distribution, concurrency, and cache state. No comparative PostgreSQL performance result is present in the repository.

## Limitations

- Timings depend on local machine hardware, runtime, and system load.
- Only a small number of recorded runs are available; they are not a formal benchmark study.
- The dataset and absent-query workload are synthetic.
- No production traffic was measured.
- The historical report predates the Redis integration; these values are in-memory measurements.

## Future benchmark ideas

- Compare direct indexed PostgreSQL existence queries with a filter-assisted API flow.
- Measure Redis network latency and end-to-end request latency.
- Test multiple capacities, false-positive targets, and hash counts.
- Measure pipeline performance at different batch sizes.
- Measure memory and false-positive growth as insertions exceed expected capacity.
- Repeat trials with controlled hardware, warm/cold state, and concurrent clients.
