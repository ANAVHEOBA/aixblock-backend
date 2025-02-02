import { PublicKey } from '@solana/web3.js';
import { solanaService } from '../../blockchain/solana.service';
import { mapSolanaError } from '../../utils/errors';
import { ContributionRequest, ContributionResponse } from './contribution.model';

export class ContributionService {
    private programService = solanaService.getProgramService();

    async recordContribution(
        contributorAddress: string,
        contributionData: ContributionRequest
    ): Promise<ContributionResponse> {
        try {
            const authority = new PublicKey(contributorAddress);
            const metadata = contributionData.metadata; // Pass as string directly

            const signature = await this.programService.recordContribution(
                authority,
                contributionData.contributionType,
                metadata, // Pass string here
                contributionData.impactScore
            );

            return {
                signature,
                contribution: {
                    contributorAddress,
                    contributionType: contributionData.contributionType,
                    metadata: contributionData.metadata,
                    impactScore: contributionData.impactScore,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            throw mapSolanaError(error);
        }
    }


    async getContributorHistory(contributorAddress: string): Promise<ContributionHistory> {
        try {
            const pubkey = new PublicKey(contributorAddress);
            
            // Fetch contributor info and contributions in parallel
            const [contributorInfo, contributions] = await Promise.all([
                this.programService.getContributorInfo(pubkey),
                this.programService.getContributorHistory(pubkey)
            ]);

            return {
                contributorAddress,
                totalPoints: contributorInfo.totalPoints,
                contributions
            };
        } catch (error) {
            throw mapSolanaError(error);
        }
    }
}

export const contributionService = new ContributionService();