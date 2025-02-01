import { Connection, PublicKey, Keypair, ConnectionConfig } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Wallet, BN } from '@project-serum/anchor';
import { IDL, PROGRAM_ID, getProvider } from './config';
import type { AixblockRewardsIDL } from './types/program';
import { config } from '../config/env';

// Define account types
type InitializeAccounts = {
    pointsConfig: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
}

type ContributorAccounts = {
    contributor: PublicKey;
    pointsConfig: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
}

type ContributionAccounts = {
    contributor: PublicKey;
    contribution: PublicKey;
    pointsConfig: PublicKey;
    authority: PublicKey;
    systemProgram: PublicKey;
}

export class ProgramService {
    private program: Program<AixblockRewardsIDL>;
    private connection: Connection;
    private wallet: Keypair;
    private pointsConfigPubkey: PublicKey;

    constructor() {
        try {
            this.connection = new Connection(config.solana.rpcEndpoint, {
                commitment: 'confirmed'
            } as ConnectionConfig);
            
            const privateKeyBase64 = config.solana.authorityPrivateKey;
            const privateKeyString = Buffer.from(privateKeyBase64, 'base64').toString();
            const privateKeyArray = JSON.parse(privateKeyString);
            const privateKeyBytes = new Uint8Array(privateKeyArray);
            
            this.wallet = Keypair.fromSecretKey(privateKeyBytes);
            
            [this.pointsConfigPubkey] = PublicKey.findProgramAddressSync(
                [Buffer.from('points_config')],
                new PublicKey(config.solana.programId)
            );
            
            console.log('Wallet public key:', this.wallet.publicKey.toBase58());
            console.log('Points config PDA:', this.pointsConfigPubkey.toBase58());
            
            const anchorWallet = new Wallet(this.wallet);
            const provider = getProvider(this.connection, anchorWallet);
            this.program = new Program(IDL, new PublicKey(config.solana.programId), provider);
        } catch (error) {
            console.error('Error initializing ProgramService:', error);
            throw error;
        }
    }

    async initializeProgram() {
        try {
            console.log('Starting initialization...');
            
            try {
                const pointsConfig = await this.program.account.pointsConfig.fetch(
                    this.pointsConfigPubkey
                );
                console.log('Points config already initialized:', pointsConfig);
                return this.pointsConfigPubkey;
            } catch (e) {
                console.log('Points config not found, initializing...');
            }

            const tx = await this.program.methods
                .initialize({
                    monthlyThreshold: new BN(1000),
                    reserveRatio: 10,
                    maxPointsPerType: new BN(100),
                })
                .accounts({
                    pointsConfig: this.pointsConfigPubkey,
                    authority: this.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                } as InitializeAccounts)
                .rpc();

            await this.connection.confirmTransaction(tx, 'confirmed');
            console.log('Initialization successful:', tx);
            
            const verifyConfig = await this.program.account.pointsConfig.fetch(
                this.pointsConfigPubkey
            );
            console.log('Verified points config:', verifyConfig);
            
            return this.pointsConfigPubkey;
        } catch (error: unknown) {
            console.error('Detailed initialization error:', error);
            if (error && typeof error === 'object' && 'logs' in error) {
                console.error('Program logs:', (error as { logs: unknown }).logs);
            }
            throw error;
        }
    }

    async recordContribution(
        authority: PublicKey,
        contributionType: string,
        metadata: Buffer,
        impactScore: number
    ): Promise<string> {
        try {
            console.log('Starting contribution recording...');
            console.log('Authority:', authority.toBase58());
            console.log('Contribution type:', contributionType);
            console.log('Impact score:', impactScore);

            const pointsConfigPubkey = await this.initializeProgram();
            console.log('Points config initialized:', pointsConfigPubkey.toBase58());

            const [contributorAddress, contributorBump] = PublicKey.findProgramAddressSync(
                [Buffer.from('contributor'), authority.toBuffer()],
                this.program.programId
            );
            console.log('Contributor PDA:', contributorAddress.toBase58());

            let contributorAccount;
            try {
                contributorAccount = await this.program.account.contributor.fetch(contributorAddress);
                console.log('Found existing contributor account');
            } catch (e) {
                console.log('Creating new contributor account...');
                
                const tx = await this.program.methods
                    .createContributor()
                    .accounts({
                        contributor: contributorAddress,
                        pointsConfig: pointsConfigPubkey,
                        authority: this.wallet.publicKey,
                        systemProgram: web3.SystemProgram.programId,
                    } as ContributorAccounts)
                    .rpc();

                await this.connection.confirmTransaction(tx, 'confirmed');
                console.log('Contributor account created:', tx);
                contributorAccount = { contributionCount: 0 };
            }

            const [contributionAddress, contributionBump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('contribution'),
                    contributorAddress.toBuffer(),
                    Buffer.from([contributorAccount.contributionCount])
                ],
                this.program.programId
            );
            console.log('Contribution PDA:', contributionAddress.toBase58());

            const tx = await this.program.methods
                .recordContribution(
                    contributionType,
                    Array.from(metadata.slice(0, 32)),
                    impactScore,
                    contributionBump
                )
                .accounts({
                    contributor: contributorAddress,
                    contribution: contributionAddress,
                    pointsConfig: pointsConfigPubkey,
                    authority: this.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                } as ContributionAccounts)
                .rpc();

            await this.connection.confirmTransaction(tx, 'confirmed');
            console.log('Contribution recorded successfully:', tx);
            return tx;
        } catch (error: unknown) {
            console.error('Error recording contribution:', error);
            if (error && typeof error === 'object' && 'logs' in error) {
                console.error('Program logs:', (error as { logs: unknown }).logs);
            }
            throw error;
        }
    }
}