# Big O Notation

Understanding how an algorithm's performance changes as its input grows.

## Overview

Big O Notation is a mathematical way to describe the efficiency of an algorithm in terms of its input size.

It helps us understand how an algorithm's execution time or memory requirements grow as the amount of data increases.

Big O focuses on the growth rate rather than measuring exact execution time.

## Why It Matters

When building scalable software, an algorithm that performs well with a small dataset may become inefficient as the dataset grows.

Understanding complexity helps developers:

- Choose efficient algorithms and data structures.
- Identify potential performance bottlenecks.
- Evaluate scalability as input sizes increase.
- Make informed engineering decisions.

## Time Complexity

Time complexity describes how the number of operations performed by an algorithm grows with input size.

| Complexity | Name | Example |
|---|---|---|
| O(1) | Constant | Accessing an array element |
| O(log n) | Logarithmic | Binary Search |
| O(n) | Linear | Linear Search |
| O(n log n) | Linearithmic | Merge Sort |
| O(n²) | Quadratic | Nested loops |

### 1. O(1) — Constant Time

The number of operations remains constant regardless of input size.

```typescript
function getFirstElement(numbers: number[]): number | undefined {
  return numbers[0];
}
```

Accessing the first array element takes constant time.

### 2. O(log n) — Logarithmic Time

The input is reduced significantly with each iteration.

```typescript
function binarySearch(numbers: number[], target: number): number {
  let left = 0;
  let right = numbers.length - 1;

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const middleValue = numbers[middle];

    if (middleValue === undefined) {
      return -1;
    }

    if (middleValue === target) {
      return middle;
    }

    if (middleValue < target) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }

  return -1;
}
```

Binary Search repeatedly divides the search range in half.

**Important:** The input array must be sorted.

### 3. O(n) — Linear Time

The number of operations grows proportionally with the input size.

```typescript
function findNumber(numbers: number[], target: number): number | undefined {
  for (const number of numbers) {
    if (number === target) {
      return number;
    }
  }

  return undefined;
}
```

In the worst case, every element must be checked.

### 4. O(n log n) — Linearithmic Time

This complexity commonly appears in efficient comparison-based sorting algorithms.

```typescript
function mergeSort(numbers: number[]): number[] {
  if (numbers.length <= 1) {
    return numbers;
  }

  const middle = Math.floor(numbers.length / 2);

  const left = mergeSort(numbers.slice(0, middle));
  const right = mergeSort(numbers.slice(middle));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];

  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    const leftValue = left[i];
    const rightValue = right[j];

    if (leftValue === undefined || rightValue === undefined) {
      break;
    }

    if (leftValue <= rightValue) {
      result.push(leftValue);
      i++;
    } else {
      result.push(rightValue);
      j++;
    }
  }

  result.push(...left.slice(i), ...right.slice(j));

  return result;
}
```

Merge Sort divides the array into smaller parts, sorts them recursively, and merges the sorted results.

Its time complexity is O(n log n) in the best, average, and worst cases.

### 5. O(n²) — Quadratic Time

The number of operations grows quadratically as the input size increases.

```typescript
function printAllPairs(numbers: number[]): void {
  for (const first of numbers) {
    for (const second of numbers) {
      console.log(`(${first}, ${second})`);
    }
  }
}
```

Each element is paired with every other element.

For an array of size `n`, this produces `n × n` pairs.

## Space Complexity

Space complexity describes how much additional memory an algorithm requires as input size grows.

| Function | Auxiliary Space |
|---|---|
| `getFirstElement` | O(1) |
| `findNumber` | O(1) |
| `binarySearch` | O(1) |
| `printAllPairs` | O(1) |
| `mergeSort` | O(n) |

Merge Sort requires additional arrays during merging and recursive calls. Its auxiliary space complexity is O(n).

The table considers auxiliary space, excluding the input array and output storage.

## Complexity Comparison

| Input Size (n) | O(1) | O(log n) | O(n) | O(n log n) | O(n²) |
|---:|---:|---:|---:|---:|---:|
| 10 | 1 | ~3 | 10 | ~33 | 100 |
| 100 | 1 | ~7 | 100 | ~664 | 10,000 |
| 1,000 | 1 | ~10 | 1,000 | ~9,966 | 1,000,000 |
| 10,000 | 1 | ~13 | 10,000 | ~132,877 | 100,000,000 |

*These are illustrative growth values, not measured execution times. Logarithms use base 2.*

## Running the Examples

Make sure you have Node.js installed.

Navigate to this directory:

```bash
cd 01-fundamentals/big-o-notation
```

Install dependencies:

```bash
npm install
```

Run the examples:

```bash
npm run dev
```

Check TypeScript types:

```bash
npm run typecheck
```

## Key Takeaways

- O(1) operations do not grow with input size.
- O(log n) algorithms reduce the problem size at each step.
- O(n) algorithms scale proportionally with input size.
- O(n log n) is common in efficient sorting algorithms.
- O(n²) algorithms can become expensive as input size increases.
- Algorithm efficiency should be evaluated alongside memory usage and practical requirements.

---

**Learn by understanding. Improve by building.**