import { BloomFilter } from '../bloom-filter';

const filter = new BloomFilter(958506, 7);

function countSetBits(bytes: Uint8Array): number {
  return bytes.reduce((total, byte) => {
    let value = byte;

    while (value !== 0) {
      total += value & 1;
      value >>= 1;
    }

    return total;
  }, 0);
}

// Insert usernames
filter.add('shahid');
filter.add('ahmed');
filter.add('ali');

// Check membership
console.log('shahid:', filter.mightContain('shahid'));
console.log('ahmed:', filter.mightContain('ahmed'));
console.log('ali:', filter.mightContain('ali'));
console.log('unknown_user:', filter.mightContain('unknown_user'));

// Inspect bit array
const bitArray = filter.getBitArray();

const nonZeroBytes = Array.from(bitArray.entries()).filter(
  ([, byte]) => byte !== 0,
);

console.log('Bit array bytes:', bitArray.length);
console.log('Non-zero bytes:', nonZeroBytes.length);
console.log('First non-zero bytes:', nonZeroBytes.slice(0, 20));

// Count set bits
const beforeDuplicateInsert = countSetBits(bitArray);

console.log('Total set bits:', beforeDuplicateInsert);

// Test duplicate insertion
filter.add('shahid');

const afterDuplicateInsert = countSetBits(filter.getBitArray());

console.log('Before duplicate insert:', beforeDuplicateInsert);
console.log('After duplicate insert:', afterDuplicateInsert);
