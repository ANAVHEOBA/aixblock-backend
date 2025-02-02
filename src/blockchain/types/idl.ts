import { Idl } from '@project-serum/anchor';
import type { AixblockRewards } from './aixblock_rewards';

export type AixblockRewardsIdl = Idl & AixblockRewards;

export function adaptIdl(idl: any): AixblockRewardsIdl {
    // Helper function to transform field types
    function transformFieldType(field: any) {
        if (field.type === 'pubkey') {
            return {
                ...field,
                type: "publicKey"
            };
        }
        if (field.type?.defined?.name === 'ContributionType') {
            return {
                ...field,
                type: {
                    defined: "ContributionType"
                }
            };
        }
        return field;
    }

    // Helper function to transform PDA seeds
    function transformPdaSeeds(pda: any) {
        if (!pda || !pda.seeds) return undefined;
        
        return {
            seeds: pda.seeds.map((seed: any) => {
                if (seed.kind === 'const') {
                    // Convert const value to string format for Anchor
                    return {
                        kind: 'const',
                        type: 'string',
                        value: Buffer.from(seed.value).toString('utf8')
                    };
                }
                if (seed.kind === 'account') {
                    return {
                        kind: 'account',
                        type: 'publicKey',
                        account: seed.account,
                        path: seed.path
                    };
                }
                return seed;
            }),
            programId: idl.metadata.address
        };
    }

    // Transform instruction accounts
    function transformInstructionAccounts(accounts: any[]) {
        return accounts.map((acc: any) => ({
            ...acc,
            name: acc.name.toLowerCase(),
            pda: transformPdaSeeds(acc.pda),
            isMut: acc.writable || false,
            isSigner: acc.signer || false
        }));
    }

    // Transform all types
    const transformedTypes = (idl.types || []).map((type: any) => {
        if (type.name === 'ContributionType') {
            return {
                name: type.name,
                type: {
                    kind: "enum",
                    variants: type.type.variants.map((variant: any) => ({
                        name: variant.name
                    }))
                }
            };
        }
        return {
            ...type,
            type: {
                ...type.type,
                fields: type.type.fields?.map(transformFieldType) || []
            }
        };
    });

    // Transform accounts with proper PDA handling
    const accounts = (idl.accounts || []).map((account: any) => {
        const accountType = idl.types.find((type: any) => type.name === account.name);
        if (!accountType) return account;

        return {
            name: account.name.toLowerCase(),
            type: {
                kind: 'struct',
                fields: accountType.type.fields.map(transformFieldType)
            },
            pda: transformPdaSeeds(account.pda),
            discriminator: account.discriminator
        };
    });

    // Create the adapted IDL
    const anchorIdl = {
        version: idl.metadata.version,
        name: idl.metadata.name.toLowerCase(),
        instructions: idl.instructions.map((ix: any) => ({
            name: ix.name.toLowerCase(),
            accounts: transformInstructionAccounts(ix.accounts),
            args: ix.name === 'initialize' ? [
                {
                    name: "args",
                    type: {
                        defined: "InitializeArgs"
                    }
                }
            ] : ix.name === 'record_contribution' ? [
                {
                    name: "contribution_type",
                    type: {
                        defined: "ContributionType"
                    }
                },
                {
                    name: "metadata",
                    type: {
                        array: ["u8", 32]
                    }
                },
                {
                    name: "impact_score",
                    type: "u8"
                },
                {
                    name: "bump",
                    type: "u8"
                }
            ] : (ix.args || []).map(transformFieldType),
            discriminator: ix.discriminator
        })),
        accounts,
        types: transformedTypes,
        events: [
            {
                name: "ContributionRecorded",
                fields: [
                    { name: "contributor", type: "publicKey" },
                    { 
                        name: "contribution_type",
                        type: {
                            defined: "ContributionType"
                        }
                    },
                    { name: "points", type: "u64" },
                    { name: "timestamp", type: "i64" },
                    { name: "period", type: "u16" }
                ]
            },
            {
                name: "ContributorCreated",
                fields: [
                    { name: "authority", type: "publicKey" },
                    { name: "contributor", type: "publicKey" },
                    { name: "timestamp", type: "i64" }
                ]
            }
        ],
        errors: idl.errors || [],
        metadata: {
            ...idl.metadata,
            address: idl.address
        }
    };

    return anchorIdl as AixblockRewardsIdl;
}