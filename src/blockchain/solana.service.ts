import { Connection, Keypair } from '@solana/web3.js';
import { config } from '../config/env';
import { ProgramService } from './program.service';

export class SolanaService {
    private connection: Connection;
    private programService: ProgramService;

    constructor() {
        this.connection = new Connection(config.solana.rpcEndpoint);
        // In production, you'd want to properly manage this keypair
        const wallet = Keypair.generate(); // Temporary for testing
        this.programService = new ProgramService(this.connection, wallet);
    }

    getProgramService(): ProgramService {
        return this.programService;
    }

    getConnection(): Connection {
        return this.connection;
    }
}

// Singleton instance
export const solanaService = new SolanaService();