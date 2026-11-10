
/**
 * Big O Notation — Time Complexity Examples
 *
 * Demonstrates how the number of operations changes
 * as the input size grows.
 */

// O(1) — Constant Time
function getFirstElement(numbers: number[]): number | undefined {
  return numbers[0];
}

// O(n) — Linear Time
function findNumber(numbers: number[], target: number): number | undefined {
  for (const number of numbers) {
    if (number === target) {
      return number;
    }
  }

  return undefined;
}

// O(log n) — Logarithmic Time
// Requires a sorted array.
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

// O(n²) — Quadratic Time
function printAllPairs(numbers: number[]): void {
  for (const first of numbers) {
    for (const second of numbers) {
      console.log(`(${first}, ${second})`);
    }
  }
}

// O(n log n) — Linearithmic Time
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

    // Both indexes are within their respective array bounds.
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

  // Append any remaining elements.
  result.push(...left.slice(i), ...right.slice(j));

  return result;
}

// Examples
const numbers = [10, 20, 30, 40, 50];

console.log("O(1):", getFirstElement(numbers));
console.log("O(n):", findNumber(numbers, 30));
console.log("O(log n):", binarySearch(numbers, 40));

console.log("O(n²):");
printAllPairs(numbers);

console.log("O(n log n):", mergeSort([50, 10, 40, 20, 30]));
