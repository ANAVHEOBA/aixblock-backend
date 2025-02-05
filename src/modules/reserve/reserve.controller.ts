import { Router, Request, Response, NextFunction } from 'express';
import { ReserveService } from './reserve.service';
import { isAppError } from '../../utils/errors';

export const reserveRouter = Router();
const reserveService = new ReserveService();

// GET /api/reserve/stats
reserveRouter.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await reserveService.getStats();
        res.json(stats);
    } catch (error) {
        if (isAppError(error)) {
            res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                message: error.message
            });
        } else {
            next(error);
        }
    }
});


reserveRouter.post('/initialize', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reserveService = new ReserveService();
        const result = await reserveService.initializeVaults();
        res.json({
            status: 'success',
            data: {
                signature: result
            }
        });
    } catch (error) {
        if (isAppError(error)) {
            res.status(error.statusCode).json({
                status: 'error',
                code: error.code,
                message: error.message
            });
        } else {
            next(error);
        }
    }
});