import { Router, Request, Response } from 'express';
import { indexer } from '../server';

export const alphabetRouter = Router();

alphabetRouter.get('/', (req: Request, res: Response) => {
    try {
        const stats = indexer.getStats();
        res.json({
            alphabetMap: stats.alphabetMap
        });
    } catch (error) {
        console.error('Error fetching alphabet map:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
