import { Idl } from '@project-serum/anchor';
import type { AixblockRewards } from './aixblock_rewards';

// Only keep the ContributionType enum if needed for frontend/API
export enum ContributionType {
    Code = 'code',
    Review = 'review',
    Documentation = 'documentation',
    Community = 'community',
    Other = 'other',
    Testing = 'testing',
    BugReport = 'bugReport',
    PullRequest = 'pullRequest',
    CodeCommit = 'codeCommit',
    CodeReview = 'codeReview'
}

// Create a type that combines Idl requirements with your generated types
export type AixblockRewardsIDL = Idl & {
    version: string;
    name: string;
} & AixblockRewards;

// Re-export the generated types
export * from './aixblock_rewards';