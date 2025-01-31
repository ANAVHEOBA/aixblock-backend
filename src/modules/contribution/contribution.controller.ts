import { Request, Response, NextFunction } from 'express';
import { contributionService } from './contribution.service';
import { ContributionRequest } from './contribution.model';
import { AppError } from '../../utils/errors';

export class ContributionController {
    async recordContribution(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract contributor address from auth token/header
            const contributorAddress = req.headers['x-contributor-address'] as string;
            if (!contributorAddress) {
                throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
            }

            const contributionData: ContributionRequest = req.body;
            
            const result = await contributionService.recordContribution(
                contributorAddress,
                contributionData
            );

            res.status(201).json({
                success: true,
                data: result,
                timestamp: Date.now()
            });
        } catch (error) {
            next(error);
        }
    }
}

export const contributionController = new ContributionController();