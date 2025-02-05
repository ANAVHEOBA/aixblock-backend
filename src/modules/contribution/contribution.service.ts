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
            // Convert contributor address to PublicKey
            const contributorPubkey = new PublicKey(contributorAddress);
            
            // Use the program's wallet (backend wallet) as the authority
            const authority = this.programService.getWalletPublicKey();
            
            console.log('Recording contribution as authority:', authority.toBase58());
            console.log('For contributor:', contributorPubkey.toBase58());
    
            const signature = await this.programService.recordContribution(
                authority,          // Backend wallet
                contributorPubkey,  // Add contributor's pubkey
                contributionData.contributionType,
                contributionData.metadata,
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
            console.error('Error in recordContribution service:', error);
            throw mapSolanaError(error);
        }
    }
    


    async getContributorHistory(contributorAddress: string): Promise<ContributionHistory> {
        try {
            console.log('Getting history for address:', contributorAddress);
            const pubkey = new PublicKey(contributorAddress);
            console.log('Created PublicKey:', pubkey.toBase58());
            
            try {
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
                // If account doesn't exist, return empty history
                if (error.message.includes('Account does not exist')) {
                    return {
                        contributorAddress,
                        totalPoints: 0,
                        contributions: []
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error('Error in getContributorHistory:', error);
            throw mapSolanaError(error);
        }
    }


     /**
     * Retrieves all contributions for the current period.
     * @returns An object containing the current period and its contributions.
     */
     async getCurrentPeriodContributions(): Promise<CurrentPeriodContributions> {
        try {
            console.log('Fetching current period contributions...');

            const contributions = await this.programService.getCurrentPeriodContributions();

            return {
                period: contributions.period,
                contributions: contributions.contributions
            };
        } catch (error) {
            console.error('Error in getCurrentPeriodContributions:', error);
            throw mapSolanaError(error);
        }
    }
}

export const contributionService = new ContributionService();