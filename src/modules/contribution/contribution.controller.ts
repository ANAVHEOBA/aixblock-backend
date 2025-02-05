import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';  // Add this import
import { contributionService } from './contribution.service';
import { ContributionRequest } from './contribution.model';
import { AppError } from '../../utils/errors';

export class ContributionController {
    async recordContribution(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the contributor address from request body or params
            const contributorAddress = req.body.contributorAddress || "EthU3J7hsudeXdTLRSSaoPQC7P75hD3r6ttPZF4uPaKK";
            
            // Validate the address first
            try {
                new PublicKey(contributorAddress);
            } catch (error) {
                throw new AppError(400, 'Invalid contributor address', 'INVALID_ADDRESS');
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
    

    async getContributorHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { contributorAddress } = req.params;

            // Validate contributor address
            try {
                const pubkey = new PublicKey(contributorAddress);
                console.log('Valid pubkey:', pubkey.toBase58());  // Add logging
            } catch (error) {
                console.error('Invalid address error:', error);  // Add logging
                throw new AppError(400, 'Invalid contributor address', 'INVALID_ADDRESS');
            }

            const history = await contributionService.getContributorHistory(contributorAddress);

            res.status(200).json({
                success: true,
                data: history,
                timestamp: Date.now()
            });
        } catch (error) {
            next(error);
        }
    }


    async getCurrentPeriodContributions(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await contributionService.getCurrentPeriodContributions();

            res.status(200).json({
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