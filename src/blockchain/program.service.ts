import {
    Connection,
    PublicKey,
    Keypair,
    ConnectionConfig,
    SystemProgram,
    TransactionSignature,
    Commitment
} from '@solana/web3.js';
import {
    Program,
    AnchorProvider,
    Wallet,
    BN,
    AnchorError
} from '@project-serum/anchor';
import { IDL, PROGRAM_ID } from './config';
import type { AixblockRewardsIDL } from './types/program';
import { ContributionType } from './types/program';
import { config } from '../config/env';

interface ContributionDetail {
    contributionAddress: string;
    contributorAddress: string;
    contributionType: string;
    metadata: string;
    impactScore: number;
    timestamp: number;
    points: number;
}

export class ProgramService {
    private program: Program<AixblockRewardsIDL>;
    private connection: Connection;
    private wallet: Keypair;
    private pointsConfigPda: PublicKey;
    private pointsConfigBump: number;

    constructor() {
        try {
            this.connection = new Connection(config.solana.rpcEndpoint, {
                commitment: 'confirmed'
            } as ConnectionConfig);

            const privateKeyBase64 = config.solana.authorityPrivateKey;
            if (!privateKeyBase64) {
                throw new Error('Authority private key is not set in the configuration.');
            }
            const privateKeyBuffer = Buffer.from(privateKeyBase64, 'base64');
            const privateKeyArray = JSON.parse(privateKeyBuffer.toString());
            this.wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

            const provider = new AnchorProvider(
                this.connection,
                new Wallet(this.wallet),
                { commitment: 'confirmed' }
            );

            this.program = new Program(
                IDL,
                new PublicKey(PROGRAM_ID),
                provider
            );

            const [pointsConfigPda, pointsConfigBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('points_config'),
                    this.wallet.publicKey.toBuffer()
                ],
                this.program.programId
            );
            this.pointsConfigPda = pointsConfigPda;
            this.pointsConfigBump = pointsConfigBump;

        } catch (error) {
            console.error('Error initializing ProgramService:', error);
            throw error;
        }
    }

    private async initializeProgram(): Promise<string> {
        try {
            console.log('Starting initialization...');
            
            // Get the PDA and bump again to ensure we have the correct ones
            const [pointsConfigPda, bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('points_config'),
                    this.wallet.publicKey.toBuffer()
                ],
                this.program.programId
            );
    
            const initializeArgs = {
                monthlyThreshold: new BN(1000000),
                reserveRatio: 1000,
                maxPointsPerType: new BN(100)
            };
    
            console.log('Initialize args:', initializeArgs);
            console.log('Points Config PDA:', pointsConfigPda.toBase58());
            console.log('Authority:', this.wallet.publicKey.toBase58());
            console.log('Bump:', bump);
    
            // Create the transaction
            const transaction = await this.program.methods
                .initialize(initializeArgs)
                .accounts({
                    points_config: pointsConfigPda,
                    authority: this.wallet.publicKey,
                    system_program: SystemProgram.programId,
                })
                .transaction();
    
            // Add recent blockhash and fee payer
            transaction.feePayer = this.wallet.publicKey;
            transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    
            // Sign the transaction
            transaction.sign(this.wallet);
    
            // Send the transaction
            const rawTransaction = transaction.serialize();
            const signature = await this.connection.sendRawTransaction(rawTransaction, {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });
    
            // Wait for confirmation
            const confirmation = await this.connection.confirmTransaction({
                signature,
                blockhash: transaction.recentBlockhash!,
                lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
            }, 'confirmed');
    
            if (confirmation.value.err) {
                throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
            }
    
            // Verify the account was created
            const pointsConfig = await this.program.account.pointsConfig.fetch(
                pointsConfigPda
            );
            
            console.log('Points config created:', pointsConfig);
            return signature;
    
        } catch (error) {
            console.error('Detailed initialization error:', error);
            if (error instanceof AnchorError) {
                console.error('Anchor Error Details:', {
                    code: error.error.errorCode,
                    msg: error.error.errorMessage,
                    program: error.program
                });
            }
            // Log additional error details if available
            if ('logs' in error) {
                console.error('Transaction logs:', error.logs);
            }
            throw error;
        }
    }
    
    async recordContribution(
        authority: PublicKey,
        contributionType: string,
        metadata: string,
        impactScore: number
    ): Promise<TransactionSignature> {
        try {
            // Ensure points config exists first
            let pointsConfig;
            try {
                pointsConfig = await this.program.account.pointsConfig.fetch(this.pointsConfigPda);
                console.log('Found existing points config:', pointsConfig);
            } catch (error) {
                console.log('Initializing points config...');
                await this.initializeProgram();
                pointsConfig = await this.program.account.pointsConfig.fetch(this.pointsConfigPda);
            }
    
            // Get contributor count for PDA seed
            let contributorAccount;
            try {
                const [contributorPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from('contributor'), authority.toBuffer()],
                    this.program.programId
                );
                contributorAccount = await this.program.account.contributor.fetch(contributorPda);
            } catch (error) {
                contributorAccount = { contributionCount: 0 };
            }
    
            const [contributionPda, contributionBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contribution'),
                    authority.toBuffer(),
                    Buffer.from([contributorAccount.contributionCount || 0])
                ],
                this.program.programId
            );
    
            const [contributorPda] = PublicKey.findProgramAddressSync(
                [Buffer.from('contributor'), authority.toBuffer()],
                this.program.programId
            );
    
            // Create metadata buffer
            const metadataBuffer = Buffer.alloc(32);
            const inputBuffer = Buffer.from(metadata, 'utf8');
            inputBuffer.copy(metadataBuffer, 0, 0, Math.min(inputBuffer.length, 32));
    
            // Convert contribution type
            const normalizedType = contributionType.charAt(0).toUpperCase() + 
                               contributionType.slice(1).toLowerCase();
    
            // Create and sign transaction
            const transaction = await this.program.methods
            .recordContribution(
                { [normalizedType]: {} },
                [...metadataBuffer],
                impactScore,
                contributionBump
            )
            .accounts({
                contributor: contributorPda,
                contribution: contributionPda,
                points_config: this.pointsConfigPda,  // Changed from pointsConfig
                authority: authority,
                system_program: SystemProgram.programId,  // Changed from systemProgram
            })
            .transaction();
    
            // Add recent blockhash and fee payer
        transaction.feePayer = this.wallet.publicKey;
        transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        // Sign the transaction
        transaction.sign(this.wallet);

        // Send the transaction
        const rawTransaction = transaction.serialize();
        const signature = await this.connection.sendRawTransaction(rawTransaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });

        // Wait for confirmation
        const confirmation = await this.connection.confirmTransaction({
            signature,
            blockhash: transaction.recentBlockhash!,
            lastValidBlockHeight: (await this.connection.getLatestBlockhash()).lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
        }

        console.log('Contribution recorded successfully:', signature);
        return signature;
    
        } catch (error) {
            console.error('Error in recordContribution:', error);
            if (error instanceof AnchorError) {
                console.error('Anchor Error Details:', {
                    code: error.error.errorCode,
                    msg: error.error.errorMessage,
                    program: error.program
                });
            }
            throw error;
        }
    }

    async getContributorHistory(contributorAddress: PublicKey): Promise<ContributionDetail[]> {
        try {
            console.log('Fetching history for contributor:', contributorAddress.toBase58());

            const contributions = await this.program.account.contribution.all([
                {
                    memcmp: {
                        offset: 8,
                        bytes: contributorAddress.toBase58()
                    }
                }
            ]);

            console.log(`Found ${contributions.length} contributions`);

            const contributionDetails = contributions.map(contribution => ({
                contributionAddress: contribution.publicKey.toBase58(),
                contributorAddress: contributorAddress.toBase58(),
                contributionType: Object.keys(contribution.account.contributionType)[0],
                metadata: Buffer.from(contribution.account.metadata).toString('utf-8').replace(/\0/g, ''),
                impactScore: contribution.account.impactScore,
                timestamp: contribution.account.timestamp.toNumber(),
                points: contribution.account.points.toNumber()
            }));

            return contributionDetails.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error fetching contributor history:', error);
            throw error;
        }
    }

    async getContributorInfo(contributorAddress: PublicKey): Promise<any> {
        try {
            const [contributorPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contributor'),
                    contributorAddress.toBuffer()
                ],
                this.program.programId
            );

            const contributorAccount = await this.program.account.contributor.fetch(contributorPda);
            return {
                address: contributorAddress.toBase58(),
                totalPoints: contributorAccount.totalPoints.toNumber(),
                lastUpdatePeriod: contributorAccount.lastUpdatePeriod,
                bump: contributorAccount.bump
            };
        } catch (error) {
            console.error('Error fetching contributor info:', error);
            throw error;
        }
    }
}