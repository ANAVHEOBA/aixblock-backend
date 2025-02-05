import { ProgramService } from '../../blockchain/program.service';
import { AppError } from '../../utils/errors';
import { DistributionStats } from './distribution.model';
import { BN } from '@project-serum/anchor';

export class DistributionService {
    private programService: ProgramService;

    constructor() {
        this.programService = new ProgramService();
    }

    async processMonthlyDistribution(period?: number): Promise<DistributionStats> {
        try {
            // Check if distribution period has ended
            const periodStatus = await this.programService.getDistributionPeriodStatus();
            
            console.log('Processing distribution with status:', {
                currentTime: new Date().toISOString(),
                environment: process.env.NODE_ENV,
                periodStatus
            });
            
            if (!periodStatus.canCalculate) {
                const timeRemaining = periodStatus.timeRemaining;
                const displayTime = process.env.NODE_ENV === 'development'
                    ? `${Math.ceil(timeRemaining / 60)} minutes`
                    : `${Math.ceil(timeRemaining / (24 * 60 * 60))} days`;
                
                throw new Error(`Distribution period not ended. Next calculation available in ${displayTime}`);
            }

            // 1. Calculate monthly points
            const calcTx = await this.programService.calculateMonthlyPoints();
            await this.programService.connection.confirmTransaction(calcTx);

            // Rest of the distribution logic remains the same
            const pointsConfig = await this.programService.getPointsConfig();
            const currentPeriod = period || pointsConfig.currentPeriod;

            const contributors = await this.programService.getAllContributors();
            const eligibleContributors = contributors.filter(
                contributor => contributor.account.currentMonthPoints.gte(new BN(pointsConfig.monthlyThreshold))
            );

            const totalPoints = eligibleContributors.reduce(
                (sum, contributor) => sum.add(contributor.account.currentMonthPoints),
                new BN(0)
            );

            const distributionAmount = this.calculateDistributionAmount(
                totalPoints.toNumber(),
                pointsConfig.reserveRatio
            );

            const transferTx = await this.programService.processReserveTransfer(
                distributionAmount,
                pointsConfig.bump
            );
            await this.programService.connection.confirmTransaction(transferTx);

            const distributionTx = await this.programService.distributeTokens(pointsConfig.bump);

            const distributions = eligibleContributors.map(contributor => ({
                contributorAddress: contributor.publicKey.toBase58(),
                points: contributor.account.currentMonthPoints.toNumber(),
                tokenAmount: this.calculateContributorAmount(
                    contributor.account.currentMonthPoints.toNumber(),
                    totalPoints.toNumber(),
                    distributionAmount
                ),
                meetsThreshold: true
            }));

            return {
                periodStats: {
                    totalPoints: totalPoints.toNumber(),
                    totalContributors: eligibleContributors.length,
                    totalDistributed: distributionAmount,
                    reserveAmount: distributionAmount * pointsConfig.reserveRatio / 10000
                },
                distributions,
                transactionSignature: distributionTx
            };

        } catch (error) {
            console.error('Error processing monthly distribution:', error);
            if (error instanceof Error) {
                throw new AppError(
                    500,
                    error.message,
                    'DISTRIBUTION_ERROR'
                );
            }
            throw new AppError(
                500,
                'Failed to process monthly distribution',
                'DISTRIBUTION_ERROR'
            );
        }
    }

    private calculateDistributionAmount(totalPoints: number, reserveRatio: number): number {
        const baseAmount = totalPoints * 100; // 100 tokens per point
        return Math.floor(baseAmount * (10000 - reserveRatio) / 10000);
    }

    private calculateContributorAmount(
        contributorPoints: number,
        totalPoints: number,
        distributionAmount: number
    ): number {
        return Math.floor((contributorPoints / totalPoints) * distributionAmount);
    }
}