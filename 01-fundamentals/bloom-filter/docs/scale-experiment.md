
# Bloom Filter — Historical Scale Experiment

This file preserves the original in-memory experiment record. The backend now also includes a Redis-backed adapter; the numbers below still come from the standalone in-memory filter and do not measure Redis or PostgreSQL. See [Experiments and Performance Analysis](04-experiments-and-performance.md) for context and a later recorded run.

## Configuration

| Parameter | Value |
|---|---:|
| Expected items | 100,000 |
| Bit array size | 958,506 bits |
| Hash functions | 7 |
| Target false-positive rate | 1% |

## Results

| Metric | Result |
|---|---:|
| Insertion time | 421.611 ms |
| Total set bits | 496,747 |
| Bit utilization | 51.83% |
| Lookup time (10,000 queries) | 68.041 ms |
| False positives | 101 |
| Observed false-positive rate | 1.01% |

## Analysis

The measured bit utilization was 51.83%, closely matching
the theoretical expectation of approximately 51.82%.

The observed false-positive rate was 1.01%, which is very
close to the target of 1%.

This local experiment is consistent with the expected occupancy and approximate false-positive behavior for the configured synthetic workload. It is a single run, not a performance guarantee.

## Limitations

- Timings are from a local development environment.
- This is a single experiment, not a formal benchmark.
- This measurement exercises the in-memory `BloomFilter` class only.
- It does not measure Redis integration, PostgreSQL query performance, or distributed behavior.
