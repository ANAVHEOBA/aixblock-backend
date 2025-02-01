import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    solana: {
        network: process.env.SOLANA_NETWORK || 'devnet',
        programId: process.env.PROGRAM_ID!,
        rpcEndpoint: process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
        authorityPrivateKey: process.env.AUTHORITY_PRIVATE_KEY!, // Add this
    }
};

// Validate required environment variables
const requiredEnvVars = ['PROGRAM_ID', 'AUTHORITY_PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}