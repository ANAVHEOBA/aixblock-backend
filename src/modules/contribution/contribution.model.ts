export interface ContributionRequest {
    contributorAddress: string;
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
    };
}

export interface ContributionDetail {
    contributionAddress: string;
    contributorAddress: string;
    contributionType: string;
    metadata: string;
    impactScore: number;
    timestamp: number;
    points: number;
}

export interface ContributionHistory {
    contributorAddress: string;
    totalPoints: number;
    contributions: ContributionDetail[];
}

export interface CurrentPeriodContributions {
    period: number;
    contributions: ContributionDetail[];
}