import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@project-serum/anchor';
import type { AixblockRewardsIdl } from './types/idl';
import idl from './idl/aixblock_rewards.json';
import { adaptIdl } from './types/idl';

// Cast and adapt the IDL
export const IDL = adaptIdl(idl);
export const PROGRAM_ID = new PublicKey('BV7MhRzrPUKPjBFYHJkuipQTcKjkSLAFJzsF3zNUYeB6');

export const getProvider = (connection: Connection, wallet: Wallet) => {
    return new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
    });
};