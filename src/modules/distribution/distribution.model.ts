export interface DistributionStats {
    periodStats: {
        totalPoints: number;
        totalContributors: number;
        totalDistributed: number;
        reserveAmount: number;
    };
    distributions: ContributorDistribution[];
    transactionSignature: string;
}

export interface ContributorDistribution {
    contributorAddress: string;
    points: number;
    tokenAmount: number;
    meetsThreshold: boolean;
}

export interface MonthlyDistributionRequest {
    period?: number;  
}

export interface MonthlyDistributionResponse {
    status: string;
    data: DistributionStats;
}