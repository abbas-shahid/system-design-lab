import { BloomFilter } from '../bloom-filter';

const EXPECTED_ITEMS = 100_000;
const BIT_SIZE = 958_506;
const HASH_COUNT = 7;

const filter = new BloomFilter(BIT_SIZE, HASH_COUNT);

// Insert 100,000 unique usernames
console.time('Insertion');

for (let i = 0; i < EXPECTED_ITEMS; i++) {
  filter.add(`user_${i}`);
}

console.timeEnd('Insertion');

// Count set bits
const bitArray = filter.getBitArray();

const totalSetBits = bitArray.reduce((total, byte) => {
  let value = byte;

  while (value !== 0) {
    total += value & 1;
    value >>= 1;
  }

  return total;
}, 0);

const utilization = (totalSetBits / BIT_SIZE) * 100;

console.log('Expected items:', EXPECTED_ITEMS);
console.log('Total set bits:', totalSetBits);
console.log('Bit array utilization:', utilization.toFixed(2) + '%');

// Test 10,000 usernames that were never inserted
let falsePositives = 0;
const TEST_ITEMS = 10_000;

console.time('Lookup');

for (let i = EXPECTED_ITEMS; i < EXPECTED_ITEMS + TEST_ITEMS; i++) {
  if (filter.mightContain(`user_${i}`)) {
    falsePositives++;
  }
}

console.timeEnd('Lookup');

const falsePositiveRate = (falsePositives / TEST_ITEMS) * 100;

console.log('Tested absent usernames:', TEST_ITEMS);
console.log('False positives:', falsePositives);
console.log(
  'Observed false-positive rate:',
  falsePositiveRate.toFixed(2) + '%',
);
