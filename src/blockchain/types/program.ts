import { Idl } from '@project-serum/anchor';
import type { AixblockRewards } from './aixblock_rewards';

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

export type AixblockRewardsIDL = Idl & {
    version: string;
    name: string;
} & AixblockRewards;

export * from './aixblock_rewards';