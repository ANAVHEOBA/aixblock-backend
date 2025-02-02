import { Connection, Keypair } from '@solana/web3.js';
import { config } from '../config/env';
import { ProgramService } from './program.service';

export class SolanaService {
    private connection: Connection;
    private programService: ProgramService;

    constructor() {
        this.connection = new Connection(config.solana.rpcEndpoint, {
            commitment: 'confirmed'
        });
        
        // Create program service with proper initialization
        this.programService = new ProgramService();
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