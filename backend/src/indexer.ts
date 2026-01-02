import fs from 'fs';
import readline from 'readline';

/**
 * Efficiently indexes the file by storing byte offsets for every Nth line.
 * This allows O(1) random access without loading the massive file into memory.
 * 
 * IMPORTANT: This indexer now tracks actual byte positions to handle files
 * with potentially mixed line endings (some \r\n, some \n).
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

        // Read file as buffer to get accurate byte positions
        const fileHandle = await fs.promises.open(this.filePath, 'r');
        const stats = await fileHandle.stat();
        const fileSize = stats.size;

        const BUFFER_SIZE = 64 * 1024; // 64KB chunks
        const buffer = Buffer.alloc(BUFFER_SIZE);

        let currentByteOffset = 0;
        let lineCount = 0;
        let lineStart = 0;
        let leftover = Buffer.alloc(0);

        while (currentByteOffset < fileSize) {
            const { bytesRead } = await fileHandle.read(buffer, 0, BUFFER_SIZE, currentByteOffset);
            if (bytesRead === 0) break;

            // Combine leftover from previous chunk with current buffer
            const chunk = Buffer.concat([leftover, buffer.subarray(0, bytesRead)]);
            let pos = 0;

            while (pos < chunk.length) {
                const newlineIndex = chunk.indexOf(0x0A, pos); // Find \n (LF)

                if (newlineIndex === -1) {
                    // No more newlines in this chunk, save leftover
                    leftover = chunk.subarray(pos);
                    break;
                }

                // Calculate actual line byte offset (accounting for leftover)
                const lineByteOffset = currentByteOffset - leftover.length + pos;

                // Store the byte offset every chunk
                if (lineCount % this.CHUNK_SIZE === 0) {
                    this.lineOffsets.push(lineByteOffset);
                }

                // Extract the line (excluding \r\n or \n)
                let lineEnd = newlineIndex;
                if (lineEnd > 0 && chunk[lineEnd - 1] === 0x0D) { // Check for \r before \n
                    lineEnd--;
                }
                const line = chunk.subarray(pos, lineEnd).toString('utf8');

                // Map the alphabet for the side menu (use first char as-is since list is pre-sorted)
                const firstLetter = line.trim()[0]?.toUpperCase();

                if (firstLetter && /^[A-Z]$/.test(firstLetter) && this.alphabetMap[firstLetter] === undefined) {
                    this.alphabetMap[firstLetter] = lineCount;
                }

                lineCount++;
                pos = newlineIndex + 1;
            }

            if (pos >= chunk.length) {
                leftover = Buffer.alloc(0);
            }
            currentByteOffset += bytesRead;
        }

        // Handle last line if file doesn't end with newline
        if (leftover.length > 0) {
            const lineByteOffset = fileSize - leftover.length;
            if (lineCount % this.CHUNK_SIZE === 0) {
                this.lineOffsets.push(lineByteOffset);
            }

            const line = leftover.toString('utf8');
            const firstLetter = line.trim()[0]?.toUpperCase();

            if (firstLetter && /^[A-Z]$/.test(firstLetter) && this.alphabetMap[firstLetter] === undefined) {
                this.alphabetMap[firstLetter] = lineCount;
            }
            lineCount++;
        }

        await fileHandle.close();

        this.totalLines = lineCount;
        console.timeEnd('Indexing Time');
        console.log(`Indexed ${this.totalLines} lines with ${this.lineOffsets.length} chunk offsets.`);
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