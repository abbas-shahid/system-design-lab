import { BloomFilter } from '../bloom-filter';

const invalidConfigurations = [
  { bitSize: 0, hashCount: 7 },
  { bitSize: -10, hashCount: 7 },
  { bitSize: 100, hashCount: 0 },
  { bitSize: 100, hashCount: -1 },
  { bitSize: 5, hashCount: 7 },
];

for (const config of invalidConfigurations) {
  try {
    new BloomFilter(config.bitSize, config.hashCount);

    console.log('Unexpected success:', config);
  } catch (error) {
    console.log(
      `Rejected (${config.bitSize}, ${config.hashCount}):`,
      (error as Error).message,
    );
  }
}

// Verify that getBitArray() returns a copy.
const filter = new BloomFilter(100, 3);

filter.add('shahid');

const externalBitArray = filter.getBitArray();

// Attempt to modify the returned array.
externalBitArray.fill(0);

console.log(
  'Membership after external modification:',
  filter.mightContain('shahid'),
);

// Verify that one insertion sets exactly 7 unique bits.
const collisionTest = new BloomFilter(10, 7);

collisionTest.add('collision-test');

const setBits = collisionTest.getBitArray().reduce((total, byte) => {
  let value = byte;

  while (value !== 0) {
    total += value & 1;
    value >>= 1;
  }

  return total;
}, 0);

console.log('Expected unique positions: 7');
console.log('Actual set bits:', setBits);
