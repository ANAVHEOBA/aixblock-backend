import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet } from '@project-serum/anchor';
import { IDL, PROGRAM_ID, getProvider } from './config';
import type { AixblockRewardsIDL } from './types/program';

export class ProgramService {
    private program: Program<AixblockRewardsIDL>;
    private connection: Connection;

    constructor(connection: Connection, wallet: Keypair) {
        this.connection = connection;
        const anchorWallet = new Wallet(wallet);
        const provider = getProvider(connection, anchorWallet);
        this.program = new Program(IDL, PROGRAM_ID, provider);
    }

    async recordContribution(
        authority: PublicKey,
        contributionType: string,
        metadata: Buffer,
        impactScore: number
    ): Promise<string> {
        try {
            // Find PDA for contributor
            const [contributorAddress] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contributor'),
                    authority.toBuffer()
                ],
                this.program.programId
            );

            // Find PDA for contribution
            const [contributionAddress, bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contribution'),
                    contributorAddress.toBuffer(),
                    Buffer.from([0]) // You might want to use actual contribution count here
                ],
                this.program.programId
            );

            // Call the program instruction
            const tx = await this.program.methods
                .recordContribution(
                    contributionType,
                    Array.from(metadata.slice(0, 32)), // Ensure 32 bytes for metadata
                    impactScore,
                    bump
                )
                .accounts({
                    contributor: contributorAddress,
                    contribution: contributionAddress,
                    pointsConfig: (await this.getPointsConfigPDA())[0],
                    authority: authority,
                    systemProgram: web3.SystemProgram.programId,
                })
                .rpc();

            return tx;
        } catch (error) {
            console.error('Error recording contribution:', error);
            throw error;
        }
    }

    private async getPointsConfigPDA(): Promise<[PublicKey, number]> {
        return PublicKey.findProgramAddressSync(
            [Buffer.from('points_config')],
            this.program.programId
        );
    }
}