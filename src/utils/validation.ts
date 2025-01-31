import { ContributionRequest } from '../modules/contribution/contribution.model';
import { AppError, ErrorCodes } from './errors';

export const ContributionValidation = {
    contributionType: ['CODE_REVIEW', 'PULL_REQUEST', 'ISSUE', 'DOCUMENTATION'],
    impactScoreRange: { min: 1, max: 10 },
    metadataLength: 32
};

export const validateContribution = (data: ContributionRequest): void => {
    if (!ContributionValidation.contributionType.includes(data.contributionType)) {
        throw new AppError(400, 'Invalid contribution type', ErrorCodes.INVALID_INPUT);
    }

    if (data.impactScore < ContributionValidation.impactScoreRange.min || 
        data.impactScore > ContributionValidation.impactScoreRange.max) {
        throw new AppError(400, 'Invalid impact score', ErrorCodes.INVALID_INPUT);
    }

    if (data.metadata.length > ContributionValidation.metadataLength) {
        throw new AppError(400, 'Metadata too long', ErrorCodes.INVALID_INPUT);
    }
};