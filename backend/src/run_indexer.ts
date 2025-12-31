import path from 'path';
import { FileIndexer } from './indexer';

const USERS_FILE = path.join(__dirname, '../data/usernames.txt');

async function main() {
    console.log(`Indexing ${USERS_FILE}...`);

    const indexer = new FileIndexer(USERS_FILE);
    await indexer.initialize();

    const stats = indexer.getStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));

    // Verify random access
    console.log('Fetching lines 0-5:');
    const firstLines = await indexer.getLines(0, 5);
    console.log(firstLines);

    // Fetch lines from middle
    const midPoint = Math.floor(stats.totalLines / 2);
    console.log(`Fetching lines ${midPoint}-${midPoint + 5}:`);
    const midLines = await indexer.getLines(midPoint, 5);
    console.log(midLines);
}

main().catch(console.error);
