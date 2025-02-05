import { Request, Response, NextFunction } from 'express';
import { DistributionService } from './distribution.service';
import { AppError } from '../../utils/errors';
import { MonthlyDistributionRequest } from './distribution.model';

export class DistributionController {
    private distributionService: DistributionService;

    constructor() {
        this.distributionService = new DistributionService();
    }

    async processMonthlyDistribution(req: Request, res: Response, next: NextFunction) {
        try {
            const request = req.body as MonthlyDistributionRequest;
            
            const result = await this.distributionService.processMonthlyDistribution(request.period);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError(500, 'Failed to process monthly distribution', 'DISTRIBUTION_ERROR'));
            }
        }
    }
}

export const distributionController = new DistributionController();