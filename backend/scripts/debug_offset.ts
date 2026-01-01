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

    // Check R
    const rIndex = stats.alphabetMap['R'];
    if (rIndex) {
        console.log(`R starts at line ${rIndex}`);
        const lines = await indexer.getLines(rIndex, 1);
        console.log(`Indexer returned for line ${rIndex}: "${lines[0]}"`);
    } else {
        console.log('R not found');
    }

    // Check Z
    const zIndex = stats.alphabetMap['Z'];
    if (zIndex) {
        console.log(`Z starts at line ${zIndex}`);
        const lines = await indexer.getLines(zIndex, 1);
        console.log(`Indexer returned for line ${zIndex}: "${lines[0]}"`);
    } else {
        console.log('Z not found');
    }
}

debug();
