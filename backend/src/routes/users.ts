import { Router, Request, Response } from 'express';
import { indexer } from '../server';

export const usersRouter = Router();

usersRouter.get('/', async (req: Request, res: Response) => {
    try {
        let skip = parseInt(req.query.skip as string) || 0;
        let limit = parseInt(req.query.limit as string) || 50;

        if (isNaN(skip) || skip < 0) skip = 0;
        if (isNaN(limit) || limit <= 0) limit = 10;
        if (limit > 100) limit = 100; // Prevent DOS

        const users = await indexer.getLines(skip, limit);

        res.json({
            users,
            meta: {
                totalLines: indexer.getStats().totalLines,
                skip,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
