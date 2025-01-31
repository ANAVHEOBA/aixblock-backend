// Custom error class for application errors
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: string
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const mapSolanaError = (error: any) => {
    const errorMapping: { [key: string]: string } = {
        'InvalidContributionType': 'The contribution type provided is invalid',
        'ContributorNotFound': 'Contributor account not found',
        'Unauthorized': 'Unauthorized access to this operation',
        'InvalidPointsCalculation': 'Error in points calculation',
        'InsufficientBalance': 'Insufficient balance for operation',
        'DistributionPeriodNotEnded': 'Distribution period is still active',
        'DistributionAlreadyProcessed': 'Distribution has already been processed',
        'BelowDistributionThreshold': 'Amount is below distribution threshold',
        'ReserveCalculationError': 'Error in reserve calculation'
    };

    const errorMessage = error.message || error.toString();
    for (const [key, value] of Object.entries(errorMapping)) {
        if (errorMessage.includes(key)) {
            return new AppError(400, value, key);
        }
    }

    // Log the original error for debugging
    console.error('Original blockchain error:', error);
    return new AppError(500, 'Internal blockchain error', 'BLOCKCHAIN_ERROR');
};

// Helper function to check if an error is an AppError
export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError;
};

// Type for error responses
export interface ErrorResponse {
    status: 'error';
    code: string;
    message: string;
}