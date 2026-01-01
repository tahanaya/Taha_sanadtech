import fs from 'fs';
import path from 'path';
import { FileIndexer } from './indexer';

// Use same file path as app
const filePath = path.join(__dirname, '../data/usernames.txt');

async function debug() {
    const indexer = new FileIndexer(filePath);
    await indexer.initialize();

    const stats = indexer.getStats();
    console.log(`Total Lines: ${stats.totalLines}`);
    console.log(`Alphabet Map L: ${stats.alphabetMap['L']}`);

    // Check line 1000
    const targetChunks = [0, 1000, 10000]; // Check a few chunks

    // We need to access private lineOffsets... 
    // Easier to just use getLines and see if it returns correct data OR read manually to verify

    console.log('--- Verifying Offsets ---');

    const stream = fs.createReadStream(filePath);
    let byteCount = 0;
    let lineCount = 0;

    stream.on('data', (chunk) => {
        // This is rough manual counting, might not be perfect with multi-byte
        // accurate approach is reading line by line and summing bytes
    });

    // Let's use getLines to see what it returns for the L index
    const lIndex = stats.alphabetMap['L'];
    if (lIndex) {
        console.log(`L starts at line ${lIndex}`);
        const lines = await indexer.getLines(lIndex, 1);
        console.log(`Indexer returned for line ${lIndex}: "${lines[0]}"`);

        if (!lines[0].startsWith('L')) {
            console.error(`ERROR: Expected L..., got ${lines[0]}`);
        } else {
            console.log('SUCCESS: L line matches.');
        }
    } else {
        console.log('L not found (random data?)');
    }

    // Check M
    const mIndex = stats.alphabetMap['M'];
    if (mIndex) {
        console.log(`M starts at line ${mIndex}`);
        const lines = await indexer.getLines(mIndex, 1);
        console.log(`Indexer returned for line ${mIndex}: "${lines[0]}"`);
    }
}

debug();
