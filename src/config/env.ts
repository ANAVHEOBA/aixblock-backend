import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    solana: {
        network: process.env.SOLANA_NETWORK || 'devnet',
        programId: process.env.PROGRAM_ID!,
        rpcEndpoint: process.env.SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
    }
};