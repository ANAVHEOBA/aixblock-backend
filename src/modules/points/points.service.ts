import { Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { ProgramService } from '../../blockchain/program.service';
import { ContributionType } from '../../blockchain/types/program';

@Injectable()
export class PointsService {
    constructor(private readonly programService: ProgramService) {}

    async recordContribution(
        authority: string,
        contributionType: string,
        metadata: string,
        impactScore: number
    ): Promise<string> {
        try {
            // Validate authority public key
            let authorityPubkey: PublicKey;
            try {
                authorityPubkey = new PublicKey(authority);
            } catch (error) {
                throw new Error('Invalid authority public key');
            }

            // Validate contribution type
            const validContributionType = this.validateContributionType(contributionType);
            if (!validContributionType) {
                throw new Error('Invalid contribution type');
            }

            // Validate impact score
            if (impactScore < 1 || impactScore > 5) {
                throw new Error('Impact score must be between 1 and 5');
            }

            // Validate metadata
            if (!metadata || metadata.length > 32) {
                throw new Error('Metadata must be provided and not exceed 32 characters');
            }

            // Record contribution on-chain
            const txSignature = await this.programService.recordContribution(
                authorityPubkey,
                validContributionType,
                metadata,
                impactScore
            );

            return txSignature;
        } catch (error) {
            console.error('Error in recordContribution:', error);
            throw error;
        }
    }

    async calculateMonthlyPoints(): Promise<string> {
        try {
            const txSignature = await this.programService.calculateMonthlyPoints();
            return txSignature;
        } catch (error) {
            console.error('Error in calculateMonthlyPoints:', error);
            throw error;
        }
    }

    async updateContributorPoints(): Promise<string> {
        try {
            const txSignature = await this.programService.updateContributorPoints();
            return txSignature;
        } catch (error) {
            console.error('Error in updateContributorPoints:', error);
            throw error;
        }
    }

    async distributeTokens(vaultAuthorityBump: number): Promise<string> {
        try {
            const txSignature = await this.programService.distributeTokens(vaultAuthorityBump);
            return txSignature;
        } catch (error) {
            console.error('Error in distributeTokens:', error);
            throw error;
        }
    }

    async processReserveTransfer(
        amount: number,
        vaultAuthorityBump: number
    ): Promise<string> {
        try {
            const txSignature = await this.programService.processReserveTransfer(
                amount,
                vaultAuthorityBump
            );
            return txSignature;
        } catch (error) {
            console.error('Error in processReserveTransfer:', error);
            throw error;
        }
    }

    async processAddToReserve(
        amount: number,
        vaultAuthorityBump: number
    ): Promise<string> {
        try {
            const txSignature = await this.programService.processAddToReserve(
                amount,
                vaultAuthorityBump
            );
            return txSignature;
        } catch (error) {
            console.error('Error in processAddToReserve:', error);
            throw error;
        }
    }

    async updateReserveConfig(
        newReserveRatio?: number,
        newMonthlyThreshold?: number
    ): Promise<string> {
        try {
            const txSignature = await this.programService.updateReserveConfig(
                newReserveRatio,
                newMonthlyThreshold
            );
            return txSignature;
        } catch (error) {
            console.error('Error in updateReserveConfig:', error);
            throw error;
        }
    }

    private validateContributionType(type: string): ContributionType | null {
        // Convert input to lowercase and remove spaces
        const normalizedType = type.toLowerCase().replace(/\s+/g, '');
        
        // Check if the normalized type exists in ContributionType enum
        const validTypes = Object.values(ContributionType);
        const matchedType = validTypes.find(
            (validType) => validType.toLowerCase() === normalizedType
        );

        if (matchedType) {
            return matchedType as ContributionType;
        }

        return null;
    }

    private async getPointsConfig(): Promise<any> {
        try {
            return await this.programService.getPointsConfig();
        } catch (error) {
            console.error('Error fetching points config:', error);
            throw error;
        }
    }

    private async getContributor(authority: PublicKey): Promise<any> {
        try {
            return await this.programService.getContributor(authority);
        } catch (error) {
            console.error('Error fetching contributor:', error);
            throw error;
        }
    }
}