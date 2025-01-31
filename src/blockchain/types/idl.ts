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
        // Handle ContributionType enum references
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

    // Transform all types
    const transformedTypes = (idl.types || []).map((type: any) => {
        // Special handling for ContributionType enum
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

    // Find and transform account types
    const accountTypes = idl.types.filter((type: any) => 
        idl.accounts.some((acc: any) => acc.name === type.name)
    ).map((type: any) => ({
        ...type,
        type: {
            ...type.type,
            fields: type.type.fields.map(transformFieldType)
        }
    }));

    // Create the adapted IDL
    const anchorIdl = {
        version: idl.metadata.version,
        name: idl.metadata.name.toLowerCase(),
        instructions: idl.instructions.map((ix: any) => {
            // Transform instruction arguments to handle enums
            const transformedArgs = ix.args?.map((arg: any) => {
                if (arg.type?.defined?.name === 'ContributionType') {
                    return {
                        ...arg,
                        type: {
                            defined: "ContributionType"
                        }
                    };
                }
                return arg;
            }) || [];

            if (ix.name === 'initialize') {
                return {
                    ...ix,
                    name: ix.name.toLowerCase(),
                    args: [
                        {
                            name: "monthly_threshold",
                            type: "u64"
                        },
                        {
                            name: "reserve_ratio",
                            type: "u16"
                        },
                        {
                            name: "max_points_per_type",
                            type: "u64"
                        }
                    ]
                };
            }
            
            if (ix.name === 'record_contribution') {
                return {
                    ...ix,
                    name: ix.name.toLowerCase(),
                    args: [
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
                    ]
                };
            }

            return {
                ...ix,
                name: ix.name.toLowerCase(),
                args: transformedArgs
            };
        }),
        accounts: accountTypes.map((type: any) => {
            const account = idl.accounts.find((acc: any) => acc.name === type.name);
            return {
                name: type.name,
                type: type.type,
                discriminator: account.discriminator
            };
        }),
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

    // Log for debugging
    console.log('Types:', JSON.stringify(anchorIdl.types, null, 2));
    console.log('ContributionType:', JSON.stringify(anchorIdl.types.find(t => t.name === 'ContributionType'), null, 2));
    
    return anchorIdl as AixblockRewardsIdl;
}