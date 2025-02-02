import {
    Connection,
    PublicKey,
    Keypair,
    ConnectionConfig,
    SystemProgram,
    TransactionSignature
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
import { config } from '../config/env';

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
    
            // Initialize wallet from private key
            const privateKeyBase64 = config.solana.authorityPrivateKey;
            if (!privateKeyBase64) {
                throw new Error('Authority private key is not set in the configuration.');
            }
            const privateKeyBuffer = Buffer.from(privateKeyBase64, 'base64');
            const privateKeyArray = JSON.parse(privateKeyBuffer.toString());
            this.wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    
            // Initialize program with proper provider
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

            // Derive points_config PDA using seeds
            const [pointsConfigPda, pointsConfigBump] = PublicKey.findProgramAddressSync(
                [Buffer.from("points_config"), this.wallet.publicKey.toBuffer()],
                this.program.programId
            );
            this.pointsConfigPda = pointsConfigPda;
            this.pointsConfigBump = pointsConfigBump;
            console.log('Points config PDA:', this.pointsConfigPda.toBase58());

        } catch (error) {
            console.error('Error initializing ProgramService:', error);
            throw error;
        }
    }

    async initializeProgram() {
        try {
            console.log('Starting initialization...');
            console.log('Points Config PDA:', this.pointsConfigPda.toBase58());
            console.log('Authority:', this.wallet.publicKey.toBase58());
            
            const tx = await this.program.methods
                .initialize({
                    monthlyThreshold: new BN(1000),
                    maxPointsPerType: new BN(500),
                    reserveRatio: 100
                })
                .accounts({
                    pointsConfig: this.pointsConfigPda,
                    authority: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([this.wallet])
                .rpc();

            // Use the newer confirmation method
            const latestBlockhash = await this.connection.getLatestBlockhash();
            await this.connection.confirmTransaction({
                signature: tx,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            });
            
            console.log('Points config initialized with tx:', tx);
            
            // Verify the account was created
            const pointsConfig = await this.program.account.pointsConfig.fetch(this.pointsConfigPda);
            console.log('Points config state:', pointsConfig);
        } catch (error) {
            console.error('Detailed initialization error:', error);
            if (error instanceof AnchorError) {
                console.error('Anchor Error Code:', error.error.errorCode);
                console.error('Anchor Error Message:', error.error.errorMessage);
                console.error('Program Log:', error.program);
            }
            throw error;
        }
    }

    async recordContribution(
        authority: PublicKey,
        contributionType: string,
        metadata: string,
        impactScore: number
    ): Promise<string> {
        try {
            console.log('Starting contribution recording...');
            console.log('Authority (Contributor):', authority.toBase58());
            console.log('Contribution Type:', contributionType);
            console.log('Impact Score:', impactScore);

            // Validate inputs
            if (!authority || !(authority instanceof PublicKey)) {
                throw new TypeError('Authority must be a valid PublicKey object');
            }
            if (!contributionType || typeof contributionType !== 'string') {
                throw new TypeError('Contribution type must be a non-empty string');
            }
            if (!metadata || typeof metadata !== 'string') {
                throw new TypeError('Metadata must be a non-empty string');
            }
            if (typeof impactScore !== 'number' || impactScore < 0 || impactScore > 255) {
                throw new TypeError('Impact score must be between 0 and 255');
            }

            // Derive contributor address
            const contributorPublicKey = authority;

            // Derive contribution address with proper seed format
            const [contributionAddress, contributionBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contribution'),
                    contributorPublicKey.toBuffer(),
                    Buffer.from([0])
                ],
                this.program.programId
            );

            console.log('Contribution address:', contributionAddress.toBase58());
            console.log('Contribution Bump:', contributionBump);

            // Create metadata array with exactly 32 bytes
            const metadataArray = new Array(32).fill(0);
            const metadataBytes = Buffer.from(metadata, 'utf8');
            
            // Copy bytes one by one, ensuring we don't exceed 32 bytes
            for (let i = 0; i < Math.min(metadataBytes.length, 32); i++) {
                metadataArray[i] = metadataBytes[i];
            }

            console.log('Metadata Array Length:', metadataArray.length);
            console.log('Points Config PDA:', this.pointsConfigPda.toBase58());
            console.log('Program Authority:', this.wallet.publicKey.toBase58());
            console.log('System Program ID:', SystemProgram.programId.toBase58());

            // Initialize points config if it doesn't exist
            try {
                await this.program.account.pointsConfig.fetch(this.pointsConfigPda);
            } catch (error) {
                console.log('Points config not found, initializing...');
                await this.initializeProgram();
            }

            // Record contribution with proper enum format for contributionType
            const txRecord = await this.program.methods
                .recordContribution(
                    { [contributionType]: {} },
                    metadataArray,
                    impactScore,
                    contributionBump
                )
                .accounts({
                    contributor: contributorPublicKey,
                    contribution: contributionAddress,
                    pointsConfig: this.pointsConfigPda,
                    authority: this.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([this.wallet])
                .rpc();

            // Use the newer confirmation method
            const latestBlockhash = await this.connection.getLatestBlockhash();
            await this.connection.confirmTransaction({
                signature: txRecord,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            });

            console.log('Contribution recorded successfully:', txRecord);
            return txRecord;
        } catch (error) {
            console.error('Error recording contribution:', error);
            if (error instanceof AnchorError) {
                console.error('Anchor Error Code:', error.error.errorCode);
                console.error('Anchor Error Message:', error.error.errorMessage);
                console.error('Program Log:', error.program);
            } else if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }
}