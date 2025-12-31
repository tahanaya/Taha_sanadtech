import fs from 'fs';
import readline from 'readline';

/**
 * The Sparse Indexer
 * Instead of loading 10M names, we store the "Byte Position" 
 * of every 1000th name.
 */
export class FileIndexer {
    private filePath: string;
    private lineOffsets: number[] = [];
    private alphabetMap: Record<string, number> = {};
    private totalLines: number = 0;
    private readonly CHUNK_SIZE = 1000; // Index every 1000 lines

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    async initialize() {
        console.time('Indexing Time');

        // 0. Detect EOL char to ensure accurate byte offsets
        const eolLength = await this.determineEOL();
        console.log(`Detected EOL length: ${eolLength}`);

        const stream = fs.createReadStream(this.filePath);
        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        let currentByteOffset = 0;
        let lineCount = 0;

        for await (const line of rl) {
            // 1. Store the byte offset every 1000 lines
            if (lineCount % this.CHUNK_SIZE === 0) {
                this.lineOffsets.push(currentByteOffset);
            }

            // 2. Map the alphabet for the side menu
            const firstLetter = line[0]?.toUpperCase();
            if (firstLetter && this.alphabetMap[firstLetter] === undefined) {
                this.alphabetMap[firstLetter] = lineCount;
            }

            // Update the byte offset for the next line
            currentByteOffset += Buffer.byteLength(line) + eolLength;
            lineCount++;
        }

        this.totalLines = lineCount;
        console.timeEnd('Indexing Time');
        console.log(`Indexed ${this.totalLines} lines.`);
    }

    private async determineEOL(): Promise<number> {
        const readable = fs.createReadStream(this.filePath, { end: 1024 });
        let chunk = '';
        for await (const part of readable) {
            chunk += part.toString();
        }

        if (chunk.includes('\r\n')) return 2;
        if (chunk.includes('\n')) return 1;
        return 1; // Default to \n if no newline found in first 1KB (unlikely for big files)
    }

    // This method allows us to "Jump" to any line instantly
    async getLines(startLine: number, limit: number): Promise<string[]> {
        const result: string[] = [];
        const indexInMap = Math.floor(startLine / this.CHUNK_SIZE);
        const startingByte = this.lineOffsets[indexInMap];

        // Open the file and jump to the starting byte
        const stream = fs.createReadStream(this.filePath, { start: startingByte });
        const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

        let currentLine = indexInMap * this.CHUNK_SIZE;
        for await (const line of rl) {
            if (currentLine >= startLine) {
                result.push(line);
            }
            currentLine++;
            if (result.length >= limit) {
                rl.close();
                stream.destroy();
                break;
            }
        }
        return result;
    }

    getStats() {
        return {
            totalLines: this.totalLines,
            alphabetMap: this.alphabetMap
        };
    }
}