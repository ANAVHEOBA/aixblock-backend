import { ProgramService } from '../../blockchain/program.service';
import { AppError } from '../../utils/errors';

export class ReserveService {
    private programService: ProgramService;

    constructor() {
        this.programService = new ProgramService();
    }

    async getStats() {
        try {
            const stats = await this.programService.getReserveStats();
            return {
                status: 'success',
                data: stats
            };
        } catch (error) {
            console.error('Error in getStats:', error);
            throw new AppError(500, 'Failed to fetch reserve statistics', 'RESERVE_STATS_ERROR');
        }
    }

    async initializeVaults() {
        try {
            const signature = await this.programService.initializeReserveVaults();
            return signature;
        } catch (error) {
            console.error('Error in initializeVaults:', error);
            throw new AppError(500, 'Failed to initialize reserve vaults', 'RESERVE_INIT_ERROR');
        }
    }
}