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
import { Transaction } from '@solana/web3.js';


import { 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction
} from '@solana/spl-token';

interface ContributionDetail {
    contributionAddress: string;
    contributorAddress: string;
    contributionType: string;
    metadata: string;
    impactScore: number;
    timestamp: number;
    points: number;
}

interface CurrentPeriodContributions {
    period: number;
    contributions: ContributionDetail[];
}

export class ProgramService {
    private program: Program<AixblockRewardsIDL>;
    private connection: Connection;
    protected wallet: Keypair;
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

            // Debug: Log available accounts
            console.log('Available Program Accounts:', Object.keys(this.program.account));

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

    getWalletPublicKey(): PublicKey {
        return this.wallet.publicKey;
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
                    pointsConfig: pointsConfigPda,
                    authority: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId
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
    
    

    async createContributorIfNeeded(authorityPublicKey: PublicKey): Promise<string | null> {
        try {
            const [contributorPda, contributorBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contributor'),
                    authorityPublicKey.toBuffer() // Ensure this matches the on-chain authority
                ],
                this.program.programId
            );
 
            try {
                await this.program.account.contributor.fetch(contributorPda);
                return null; // Contributor already exists
            } catch (error) {
                if (error.message.includes('Account does not exist')) {
                    console.log('Creating new contributor account...');
                    console.log('Contributor PDA:', contributorPda.toBase58());
                    console.log('Authority:', authorityPublicKey.toBase58());
 
                    const tx = await this.program.methods
                        .createContributor()
                        .accounts({
                            contributor: contributorPda,
                            authority: authorityPublicKey, // Use authorityPublicKey here
                            systemProgram: SystemProgram.programId,
                        })
                        .signers([this.wallet]) // Ensure the authority is signing
                        .rpc();
 
                    await this.connection.confirmTransaction(tx, 'confirmed');
                    console.log('Contributor account created successfully');
                    return tx;
                }
                throw error;
            }
        } catch (error) {
            console.error('Error in createContributorIfNeeded:', error);
            throw error;
        }
    }
    
    // src/blockchain/program.service.ts

async recordContribution(
    authority: PublicKey,
    contributor: PublicKey,
    contributionType: string,
    metadata: string,
    impactScore: number
): Promise<string> {
    try {
        console.log('Recording contribution as:', authority.toBase58());
        console.log('For contributor:', contributor.toBase58());
        console.log('Type:', contributionType);
        console.log('Impact Score:', impactScore);

        // Create contributor account if it doesn't exist
        const createTx = await this.createContributorIfNeeded(authority);
        if (createTx) {
            console.log('Created new contributor account, tx:', createTx);
            await this.connection.confirmTransaction(createTx);
        }

        // Derive the contributor PDA using authority
        const [contributorPda, contributorBump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('contributor'),
                authority.toBuffer()
            ],
            this.program.programId
        );

        console.log('Contributor PDA:', contributorPda.toBase58());

        // Fetch the contributor account to get the contribution count
        const contributorAccount = await this.program.account.contributor.fetch(contributorPda);
        const contributionCount = contributorAccount.contributionCount;

        console.log('Contribution Count:', contributionCount);

        // Convert contribution count to 4-byte (u32) buffer
        const countBuffer = Buffer.alloc(4);
        countBuffer.writeUInt32LE(contributionCount);

        // Derive the contribution PDA
        const [contributionPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('contribution'),
                contributorPda.toBuffer(),
                countBuffer
            ],
            this.program.programId
        );

        console.log('Contribution PDA:', contributionPda.toBase58());

        const normalizedType = contributionType.charAt(0).toLowerCase() + contributionType.slice(1);
        const tx = await this.program.methods
            .recordContribution(
                { [normalizedType]: {} },
                [...Buffer.from(metadata.slice(0, 32).padEnd(32, '\0'))],
                new BN(impactScore),
                contributorBump
            )
            .accounts({
                authority: authority, // Use the passed authority
                contributor: contributorPda,
                contribution: contributionPda,
                pointsConfig: this.pointsConfigPda,
                systemProgram: SystemProgram.programId
            })
            .signers([this.wallet])
            .rpc();

        await this.connection.confirmTransaction(tx, 'confirmed');
        return tx;
    } catch (error) {
        console.error('Error in recordContribution:', error);
        throw error;
    }
}

    
    // src/blockchain/program.service.ts

async getContributorHistory(authorityPublicKey: PublicKey): Promise<ContributionDetail[]> {
    try {
        console.log('Fetching history for contributor:', authorityPublicKey.toBase58());

        // Derive contributor PDA using consistent seeds
        const [contributorPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('contributor'),
                authorityPublicKey.toBuffer()
            ],
            this.program.programId
        );

        // Fetch all contributions related to this contributor PDA
        const contributions = await this.program.account.contribution.all([
            {
                memcmp: {
                    offset: 8, // Discriminator
                    bytes: contributorPda.toBase58()
                }
            }
        ]);

        console.log(`Found ${contributions.length} contributions`);

        const contributionDetails = contributions.map(contribution => ({
            contributionAddress: contribution.publicKey.toBase58(),
            contributorAddress: authorityPublicKey.toBase58(),
            contributionType: Object.keys(contribution.account.contributionType)[0],
            metadata: Buffer.from(contribution.account.metadata).toString('utf-8').replace(/\0/g, ''),
            impactScore: contribution.account.impactScore.toNumber(),
            timestamp: contribution.account.timestamp.toNumber(),
            points: contribution.account.points.toNumber()
        }));

        return contributionDetails.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Error fetching contributor history:', error);
        throw error;
    }
}

async getContributorInfo(authorityPublicKey: PublicKey): Promise<any> {
    try {
        const [contributorPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('contributor'),
                authorityPublicKey.toBuffer()
            ],
            this.program.programId
        );

        try {
            const contributorAccount = await this.program.account.contributor.fetch(contributorPda);
            return {
                address: authorityPublicKey.toBase58(),
                totalPoints: contributorAccount.totalPoints.toNumber(),
                lastUpdatePeriod: contributorAccount.lastUpdatePeriod,
                bump: contributorAccount.bump
            };
        } catch (error) {
            if (error.message.includes('Account does not exist')) {
                // Return default values for non-existent account
                return {
                    address: authorityPublicKey.toBase58(),
                    totalPoints: 0,
                    lastUpdatePeriod: 0,
                    bump: 0
                };
            }
            throw error;
        }
    } catch (error) {
        console.error('Error fetching contributor info:', error);
        throw error;
    }
}


async getCurrentPeriodContributions(): Promise<CurrentPeriodContributions> {
    try {
        console.log('Fetching current period contributions...');
        console.log('pointsConfig PDA:', this.pointsConfigPda.toBase58());

        const pointsConfigAccount = await this.program.account.pointsConfig.fetch(this.pointsConfigPda);
        console.log('pointsConfigAccount:', pointsConfigAccount);

        const currentPeriod = pointsConfigAccount.currentPeriod;
        console.log('Current Period:', currentPeriod);

        // Fetch all contributions and filter in memory
        const allContributions = await this.program.account.contribution.all();
        console.log(`Found ${allContributions.length} total contributions`);

        // Filter contributions for the current period
        const contributions = allContributions.filter(contribution => {
            return contribution.account.period === currentPeriod;
        });

        console.log(`Found ${contributions.length} contributions in current period.`);

        // Add debug logging
        contributions.forEach((contribution, index) => {
            console.log(`Contribution ${index}:`, {
                address: contribution.publicKey.toBase58(),
                contributor: contribution.account.contributor?.toBase58(),
                type: contribution.account.contributionType,
                impactScore: contribution.account.impactScore,
                timestamp: contribution.account.timestamp,
                points: contribution.account.points
            });
        });

        const contributionDetails: ContributionDetail[] = contributions.map(contribution => {
            // Safely access and convert values
            const impactScore = contribution.account.impactScore ? 
                (typeof contribution.account.impactScore.toNumber === 'function' ? 
                    contribution.account.impactScore.toNumber() : 
                    Number(contribution.account.impactScore)) : 0;

            const timestamp = contribution.account.timestamp ? 
                (typeof contribution.account.timestamp.toNumber === 'function' ? 
                    contribution.account.timestamp.toNumber() : 
                    Number(contribution.account.timestamp)) : 0;

            const points = contribution.account.points ? 
                (typeof contribution.account.points.toNumber === 'function' ? 
                    contribution.account.points.toNumber() : 
                    Number(contribution.account.points)) : 0;

            return {
                contributionAddress: contribution.publicKey.toBase58(),
                contributorAddress: contribution.account.contributor.toBase58(),
                contributionType: Object.keys(contribution.account.contributionType)[0],
                metadata: Buffer.from(contribution.account.metadata || []).toString('utf-8').replace(/\0/g, ''),
                impactScore,
                timestamp,
                points
            };
        });

        return {
            period: currentPeriod,
            contributions: contributionDetails.sort((a, b) => b.timestamp - a.timestamp)
        };
    } catch (error) {
        console.error('Error fetching current period contributions:', error);
        throw error;
    }
}


async getReserveStats() {
    try {
        // Get the reserve vault and distribution vault PDAs
        const [reserveVaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('reserve_vault')],
            this.program.programId
        );

        const [distributionVaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('distribution_vault')],
            this.program.programId
        );

        console.log('Reserve Vault PDA:', reserveVaultPda.toBase58());
        console.log('Distribution Vault PDA:', distributionVaultPda.toBase58());

        try {
            // Try to fetch token balances
            const reserveBalance = await this.connection.getTokenAccountBalance(reserveVaultPda);
            const distributionBalance = await this.connection.getTokenAccountBalance(distributionVaultPda);

            return {
                balance: reserveBalance.value.uiAmount || 0,
                distributionVaultBalance: distributionBalance.value.uiAmount || 0
            };
        } catch (error) {
            console.log('Token accounts not found, returning zero balances');
            // If token accounts don't exist yet, return zero balances
            return {
                balance: 0,
                distributionVaultBalance: 0
            };
        }
    } catch (error) {
        console.error('Error fetching reserve stats:', error);
        throw error;
    }
}



async initializeReserveVaults(): Promise<string> {
    try {
        // Derive PDAs
        const [reserveVaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('reserve_vault')],
            this.program.programId
        );

        const [distributionVaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('distribution_vault')],
            this.program.programId
        );

        const [reserveVaultAuthority, reserveVaultAuthorityBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('reserve_vault_authority')],
            this.program.programId
        );

        const [distributionVaultAuthority, distributionVaultAuthorityBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('distribution_vault_authority')],
            this.program.programId
        );

        // Points Config PDA
        const [pointsConfigPda, pointsConfigBump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('points_config'),
                this.wallet.publicKey.toBuffer()
            ],
            this.program.programId
        );

        console.log('Creating token accounts...');
        
        // Token Mint Address
        const TOKEN_MINT_ADDRESS = new PublicKey("BCjmzUygrht6r8erHKc3U3fupbc5BzeotrR3sBUST9J2");

        // Derive ATAs with Correct Owner
        const reserveATA = await getAssociatedTokenAddress(
            TOKEN_MINT_ADDRESS,
            reserveVaultAuthority, // Correct Owner
            true, // allowOwnerOffCurve
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const distributionATA = await getAssociatedTokenAddress(
            TOKEN_MINT_ADDRESS,
            distributionVaultAuthority, // Correct Owner
            true, // allowOwnerOffCurve
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Create ATA Instructions with Correct Owner
        const createReserveVaultIx = createAssociatedTokenAccountInstruction(
            this.wallet.publicKey, // payer
            reserveATA, // ata
            reserveVaultAuthority, // Correct Owner
            TOKEN_MINT_ADDRESS, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const createDistributionVaultIx = createAssociatedTokenAccountInstruction(
            this.wallet.publicKey, // payer
            distributionATA, // ata
            distributionVaultAuthority, // Correct Owner
            TOKEN_MINT_ADDRESS, // mint
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Create and send transaction
        const createAccountsTx = new Transaction()
            .add(createReserveVaultIx)
            .add(createDistributionVaultIx);

        createAccountsTx.feePayer = this.wallet.publicKey;
        createAccountsTx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;

        // Sign and send using AnchorProvider's wallet
        const signedTx = await this.program.provider.wallet.signTransaction(createAccountsTx);
        const createAccountsSig = await this.connection.sendRawTransaction(signedTx.serialize());
        await this.connection.confirmTransaction(createAccountsSig);

        console.log('Token accounts created successfully');
        console.log('Initializing vaults...');
        console.log('Reserve Vault:', reserveVaultPda.toBase58());
        console.log('Distribution Vault:', distributionVaultPda.toBase58());

        // Initialize vaults with appropriate initial amount
        const initialAmount = new BN(1000); // Example non-zero value

        console.log('Process Add To Reserve with initial amount:', initialAmount.toString());

        const tx = await this.program.methods
            .processAddToReserve(
                initialAmount, // Initial amount
                reserveVaultAuthorityBump // Correct bump
            )
            .accounts({
                pointsConfig: pointsConfigPda,
                reserveVault: reserveATA, // ATA of reserve vault
                distributionVault: distributionATA, // ATA of distribution vault
                reserveVaultAuthority: reserveVaultAuthority,
                distributionVaultAuthority: distributionVaultAuthority,
                authority: this.wallet.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .signers([]) // No additional signers if Anchor handles PDA
            .rpc();

        await this.connection.confirmTransaction(tx);
        console.log('Vaults initialized successfully:', tx);

        return tx;
    } catch (error) {
        console.error('Error initializing reserve vaults:', error);
        throw error;
    }
}

async getAllContributors() {
    try {
        return await this.program.account.contributor.all();
    } catch (error) {
        console.error('Error fetching all contributors:', error);
        throw error;
    }
}

async calculateMonthlyPoints(): Promise<string> {
    try {
        const periodStatus = await this.getDistributionPeriodStatus();
        
        if (!periodStatus.canCalculate) {
            const timeRemaining = periodStatus.timeRemaining;
            const displayTime = process.env.NODE_ENV === 'development'
                ? `${Math.ceil(timeRemaining)} seconds`
                : `${Math.ceil(timeRemaining / (24 * 60 * 60))} days`;
                
            throw new Error(`Distribution period not ended. Please wait ${displayTime}.`);
        }

        // Derive the distribution account PDA
        const [distributionAccountPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('distribution'),
                new BN(periodStatus.currentPeriod).toArrayLike(Buffer, 'le', 2)
            ],
            this.program.programId
        );

        const tx = await this.program.methods
            .calculateMonthlyPoints()
            .accounts({
                pointsConfig: this.pointsConfigPda,
                authority: this.wallet.publicKey,
                distributionAccount: distributionAccountPda,
                systemProgram: SystemProgram.programId,
            })
            .signers([this.wallet])
            .rpc();

        return tx;
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('6003')) {
                throw new Error('Distribution period not ended. Please try again in a few seconds.');
            }
        }
        throw error;
    }
}

async getDistributionPeriodStatus(): Promise<{
    currentPeriod: number;
    lastCalculationTime: number;
    nextCalculationTime: number;
    canCalculate: boolean;
    timeRemaining: number;
}> {
    try {
        const pointsConfig = await this.program.account.pointsConfig.fetch(
            this.pointsConfigPda
        );
        
        const currentTime = Math.floor(Date.now() / 1000);
        const lastCalculationTime = pointsConfig.lastCalculationTime.toNumber();
        
        // Match the period length with the smart contract
        const PERIOD_LENGTH = process.env.NODE_ENV === 'development'
            ? 1 * 60 // 1 minute for development
            : 30 * 24 * 60 * 60; // 30 days for production
            
        const nextCalculationTime = lastCalculationTime + PERIOD_LENGTH;

        // Add buffer time to ensure we're safely past the period end
        const SAFETY_BUFFER = 2; // 2 seconds buffer
        const timeRemaining = Math.max(0, nextCalculationTime + SAFETY_BUFFER - currentTime);
        const canCalculate = currentTime > nextCalculationTime + SAFETY_BUFFER;

        console.log('Distribution Period Status:', {
            currentTime: new Date(currentTime * 1000).toISOString(),
            lastCalculationTime: new Date(lastCalculationTime * 1000).toISOString(),
            nextCalculationTime: new Date(nextCalculationTime * 1000).toISOString(),
            timeRemaining,
            isDevelopment: process.env.NODE_ENV === 'development',
            periodLength: PERIOD_LENGTH,
            currentPeriod: pointsConfig.currentPeriod,
            safetyBuffer: SAFETY_BUFFER,
            canCalculate
        });
        
        return {
            currentPeriod: pointsConfig.currentPeriod,
            lastCalculationTime,
            nextCalculationTime,
            canCalculate,
            timeRemaining
        };
    } catch (error) {
        console.error('Error getting distribution period status:', error);
        throw error;
    }
}

// Helper method to get current period
private async getCurrentPeriod(): Promise<number> {
    try {
        const pointsConfig = await this.program.account.pointsConfig.fetch(
            this.pointsConfigPda
        );
        return pointsConfig.currentPeriod;
    } catch (error) {
        console.error('Error fetching current period:', error);
        throw error;
    }
}

async distributeTokens(vaultAuthorityBump: number): Promise<string> {
    try {
        const tx = await this.program.methods
            .distributeTokens(vaultAuthorityBump)
            .accounts({
                pointsConfig: this.pointsConfigPda,
                authority: this.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([this.wallet])
            .rpc();

        return tx;
    } catch (error) {
        console.error('Error distributing tokens:', error);
        throw error;
    }
}
}