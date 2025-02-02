import {
    Connection,
    PublicKey,
    Keypair,
    ConnectionConfig,
    SystemProgram
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
import { readFileSync } from 'fs';
import path from 'path';

export class ProgramService {
    private program: Program<AixblockRewardsIDL>;
    private connection: Connection;
    private wallet: Keypair;
    private pointsConfigKeypair: Keypair;

    constructor() {
        try {
            // Initialize connection with proper config
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
            const privateKeyBytes = new Uint8Array(privateKeyArray);
            this.wallet = Keypair.fromSecretKey(privateKeyBytes);

            // Load the persisted pointsConfig keypair
            const pointsConfigKeypairPath = path.resolve(__dirname, '../keypairs/points_config_keypair.json');
            if (!pointsConfigKeypairPath) {
                throw new Error('PointsConfig keypair path is not set.');
            }
            const pointsConfigSecretRaw = readFileSync(pointsConfigKeypairPath, 'utf-8');
            const pointsConfigSecret = JSON.parse(pointsConfigSecretRaw);
            this.pointsConfigKeypair = Keypair.fromSecretKey(new Uint8Array(pointsConfigSecret));

            console.log('Wallet public key:', this.wallet.publicKey.toBase58());
            console.log('Points config pubkey:', this.pointsConfigKeypair.publicKey.toBase58());

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
        } catch (error) {
            console.error('Error initializing ProgramService:', error);
            throw error;
        }
    }

    /**
     * Initializes the PointsConfig account if it doesn't exist.
     */
    async initializeProgram() {
        try {
            console.log('Starting initialization...');

            // Check if pointsConfig already exists
            try {
                const pointsConfig = await this.program.account.pointsConfig.fetch(this.pointsConfigKeypair.publicKey);
                console.log('Points config already exists:', pointsConfig);
            } catch (error) {
                console.log('Points config not found, initializing...');
                // Initialize pointsConfig
                const tx = await this.program.methods
                    .initialize(new BN(1000), new BN(500), new BN(100))
                    .accounts({
                        pointsConfig: this.pointsConfigKeypair.publicKey, // camelCase
                        authority: this.wallet.publicKey,
                        systemProgram: SystemProgram.programId, // camelCase
                    })
                    .signers([this.wallet, this.pointsConfigKeypair])
                    .rpc();

                console.log('Transaction signature:', tx);

                await this.connection.confirmTransaction(tx, 'confirmed');
                console.log('Initialization successful:', tx);
            }
        } catch (error) {
            console.error('Detailed initialization error:', error);
            if (error instanceof AnchorError) {
                console.error('Anchor Error:', error.error.errorMessage);
                console.error('Transaction Signature:', error.transactionSignature);
            } else if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }

    // Inside the ProgramService class

/**
 * Records a contribution.
 * @param authority - The authority's public key as a PublicKey object.
 * @param contributionType - The type of contribution (e.g., "Code", "Review").
 * @param metadata - Metadata associated with the contribution.
 * @param impactScore - Impact score of the contribution.
 * @returns The transaction signature.
 */
async recordContribution(
    authority: PublicKey,
    contributionType: string,
    metadata: string,
    impactScore: number
) {
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
        if (typeof impactScore !== 'number' || impactScore < 0) {
            throw new TypeError('Impact score must be a non-negative number');
        }

        // Derive contributor address (assuming using PDA or similar logic)
        const contributorPublicKey = authority;

        // Derive contribution address
        const [contributionAddress, contributionBumpDerived] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('contribution'),
                contributorPublicKey.toBuffer(),
                Buffer.from([0]) // Replace with actual contribution count if necessary
            ],
            this.program.programId
        );
        console.log('Contribution address:', contributionAddress.toBase58());

        // Prepare metadata buffer
        const metadataBuffer = Buffer.alloc(32);
        metadataBuffer.write(metadata.slice(0, 32), 'utf8'); // Ensure metadata is at most 32 bytes
        const metadataArray = Array.from(metadataBuffer);

        console.log('Points Config Public Key:', this.pointsConfigKeypair.publicKey.toBase58());
        console.log('Program Authority:', this.wallet.publicKey.toBase58());
        console.log('System Program ID:', SystemProgram.programId.toBase58());

        // Record contribution
        const txRecord = await this.program.methods
            .recordContribution(
                {
                    [contributionType]: {} // Use exact case as defined in IDL
                },
                metadataArray,
                impactScore,
                contributionBumpDerived
            )
            .accounts({
                contributor: contributorPublicKey,
                contribution: contributionAddress,
                points_config: this.pointsConfigKeypair.publicKey, // Use snake_case key
                authority: this.wallet.publicKey,
                system_program: SystemProgram.programId, // Use snake_case key
            })
            .signers([this.wallet]) // Only wallet is a signer
            .rpc();

        console.log('Transaction signature:', txRecord);

        await this.connection.confirmTransaction(txRecord, 'confirmed');
        console.log('Contribution recorded successfully:', txRecord);
        return txRecord;
    } catch (error) {
        console.error('Error recording contribution:', error);
        if (error instanceof AnchorError) {
            console.error('Anchor Error:', error.error.errorMessage);
            console.error('Transaction Signature:', error.transactionSignature);
        } else if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
}
}