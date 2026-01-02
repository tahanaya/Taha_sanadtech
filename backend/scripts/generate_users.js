const fs = require('fs');
const path = require('path');

// Target: 10 Million Users
const TOTAL_TARGET = 10_000_000;
const BATCH_SIZE = Math.ceil(TOTAL_TARGET / 26); // ~385,000 per letter
const OUTPUT_FILE = path.join(__dirname, 'data', 'usernames.txt');

// Helper data to make names look semi-realistic
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'z'];

// Function to generate a random pronounceable suffix
function getRandomSuffix(length) {
  let suffix = '';
  for (let i = 0; i < length; i++) {
    suffix += (i % 2 === 0) ? vowels[Math.floor(Math.random() * vowels.length)] : consonants[Math.floor(Math.random() * consonants.length)];
  }
  return suffix;
}

// Generate `count` names starting with `startLetter`
function generateBatch(startLetter, count) {
  const batch = [];
  for (let i = 0; i < count; i++) {
    // Make a semi-random first name and pair with a random last name
    const firstName = startLetter + getRandomSuffix(Math.floor(Math.random() * 5) + 3); 
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName}`;
    batch.push(fullName);
  }
  return batch.sort(); // keep batch sorted before writing
}

async function main() {
  console.time('Generation Time');
  console.log(`🚀 Starting generation of ${TOTAL_TARGET.toLocaleString()} users...`);

  // Create output directory if missing
  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const stream = fs.createWriteStream(OUTPUT_FILE, { flags: 'w' });

  let totalWritten = 0;

  // Loop A-Z
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    console.log(`📝 Generating batch for '${letter}'...`);

    const batch = generateBatch(letter, BATCH_SIZE);
    
    // write batch and wait for drain if needed
    const canWrite = stream.write(batch.join('\n') + '\n');
    
    totalWritten += batch.length;
    
    // Optional: hint GC for long-running generation scripts
    if (global.gc) global.gc();

    if (!canWrite) {
      await new Promise(resolve => stream.once('drain', resolve));
    }
  }

  stream.end();

  stream.on('finish', () => {
    console.log('✅ Done!');
    console.log(`📂 File saved to: ${OUTPUT_FILE}`);
    console.log(`👥 Total Lines: ${totalWritten.toLocaleString()}`);
    console.timeEnd('Generation Time');
  });
}

main();