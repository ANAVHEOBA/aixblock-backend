import { Idl } from '@project-serum/anchor';
import type { AixblockRewards } from './aixblock_rewards';

export enum ContributionType {
    Code = 'Code',
    Review = 'Review',
    Documentation = 'Documentation',
    Community = 'Community',
    Other = 'Other',
    Testing = 'Testing',
    BugReport = 'BugReport',
    PullRequest = 'PullRequest',
    CodeCommit = 'CodeCommit',
    CodeReview = 'CodeReview'
}

export interface InitializeArgs {
    monthlyThreshold: number;
    reserveRatio: number;
    maxPointsPerType: number;
}

export type AixblockRewardsIDL = Idl & {
    version: string;
    name: string;
} & AixblockRewards;

export * from './aixblock_rewards';