export interface ContributionRequest {
    contributionType: string;
    metadata: string;
    impactScore: number;
}

export interface ContributionResponse {
    signature: string;
    contribution: {
        contributorAddress: string;
        contributionType: string;
        metadata: string;
        impactScore: number;
        timestamp: number;
        points?: number;
    }
}