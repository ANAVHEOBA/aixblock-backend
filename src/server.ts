import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { config } from './config/env';
import { AppError } from './utils/errors';
import { contributionController } from './modules/contribution/contribution.controller';
import { reserveRouter } from './modules/reserve/reserve.controller';
import { distributionController } from './modules/distribution/distribution.controller';

const app = express();

app.use(express.json());

// Routes
app.post(
    '/api/contributions/record',
    (req, res, next) => contributionController.recordContribution(req, res, next)
);

// Define the static route before the dynamic route
app.get(
    '/api/contributions/current-period',
    (req, res, next) => contributionController.getCurrentPeriodContributions(req, res, next)
);

app.get(
    '/api/contributions/:contributorAddress',
    (req, res, next) => contributionController.getContributorHistory(req, res, next)
);

app.post(
    '/api/distributions/process-monthly',
    (req, res, next) => distributionController.processMonthlyDistribution(req, res, next)
);

app.use('/api/reserve', reserveRouter);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {  // Add return type void
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message
            },
            timestamp: Date.now()
        });
        return;  // Add explicit return
    }

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        },
        timestamp: Date.now()
    });
    return;  // Add explicit return
};

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});