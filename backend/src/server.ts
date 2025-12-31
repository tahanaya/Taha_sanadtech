import app from './app';
import path from 'path';
import { FileIndexer } from './indexer';

const PORT = 3000;
const DATA_FILE = path.join(__dirname, '../data/usernames.txt');

// Global indexer instance
export let indexer: FileIndexer;

async function startServer() {
    try {
        console.log('Initializing Indexer...');
        indexer = new FileIndexer(DATA_FILE);
        await indexer.initialize();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
