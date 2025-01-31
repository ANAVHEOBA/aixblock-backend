/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aixblock_rewards.json`.
 */
export type AixblockRewards = {
    "address": "BV7MhRzrPUKPjBFYHJkuipQTcKjkSLAFJzsF3zNUYeB6",
    "metadata": {
      "name": "aixblockRewards",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "calculateMonthlyPoints",
        "discriminator": [
          45,
          207,
          187,
          60,
          35,
          57,
          248,
          232
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "distributionAccount"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "createContributor",
        "discriminator": [
          110,
          184,
          236,
          66,
          220,
          3,
          68,
          216
        ],
        "accounts": [
          {
            "name": "contributor",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": []
      },
      {
        "name": "distributeTokens",
        "discriminator": [
          105,
          69,
          130,
          52,
          196,
          28,
          176,
          120
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "contributor",
            "writable": true
          },
          {
            "name": "rewardVault",
            "writable": true
          },
          {
            "name": "contributorTokenAccount",
            "writable": true
          },
          {
            "name": "rewardVaultAuthority"
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "distributionPeriod",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    100,
                    105,
                    115,
                    116,
                    114,
                    105,
                    98,
                    117,
                    116,
                    105,
                    111,
                    110
                  ]
                },
                {
                  "kind": "account",
                  "path": "pointsConfig"
                },
                {
                  "kind": "account",
                  "path": "points_config.current_period",
                  "account": "pointsConfig"
                }
              ]
            }
          }
        ],
        "args": [
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true,
            "signer": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "args",
            "type": {
              "defined": {
                "name": "initializeArgs"
              }
            }
          }
        ]
      },
      {
        "name": "processAddToReserve",
        "discriminator": [
          29,
          251,
          98,
          127,
          86,
          190,
          166,
          90
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "reserveVault",
            "writable": true
          },
          {
            "name": "distributionVault",
            "writable": true
          },
          {
            "name": "reserveVaultAuthority"
          },
          {
            "name": "distributionVaultAuthority"
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          }
        ]
      },
      {
        "name": "processReserveTransfer",
        "discriminator": [
          230,
          31,
          187,
          88,
          0,
          36,
          68,
          74
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "reserveVault",
            "writable": true
          },
          {
            "name": "distributionVault",
            "writable": true
          },
          {
            "name": "reserveVaultAuthority"
          },
          {
            "name": "distributionVaultAuthority"
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          }
        ]
      },
      {
        "name": "recordContribution",
        "discriminator": [
          121,
          55,
          143,
          174,
          85,
          36,
          104,
          228
        ],
        "accounts": [
          {
            "name": "contributor",
            "writable": true
          },
          {
            "name": "contribution",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    111,
                    110,
                    116,
                    114,
                    105,
                    98,
                    117,
                    116,
                    105,
                    111,
                    110
                  ]
                },
                {
                  "kind": "account",
                  "path": "contributor"
                },
                {
                  "kind": "account",
                  "path": "contributor.contribution_count",
                  "account": "contributor"
                }
              ]
            }
          },
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "contributionType",
            "type": {
              "defined": {
                "name": "contributionType"
              }
            }
          },
          {
            "name": "metadata",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "impactScore",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      },
      {
        "name": "updateContributorPoints",
        "discriminator": [
          234,
          38,
          1,
          28,
          125,
          167,
          16,
          44
        ],
        "accounts": [
          {
            "name": "contributor",
            "writable": true
          },
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "authority",
            "signer": true
          }
        ],
        "args": []
      },
      {
        "name": "updateReserveConfig",
        "discriminator": [
          61,
          148,
          100,
          70,
          143,
          107,
          17,
          13
        ],
        "accounts": [
          {
            "name": "pointsConfig",
            "writable": true
          },
          {
            "name": "authority",
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "newReserveRatio",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "newMonthlyThreshold",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "contribution",
        "discriminator": [
          182,
          187,
          14,
          111,
          72,
          167,
          242,
          212
        ]
      },
      {
        "name": "contributor",
        "discriminator": [
          222,
          222,
          255,
          212,
          133,
          49,
          27,
          93
        ]
      },
      {
        "name": "distributionPeriod",
        "discriminator": [
          99,
          41,
          15,
          186,
          246,
          24,
          115,
          140
        ]
      },
      {
        "name": "pointsConfig",
        "discriminator": [
          224,
          166,
          24,
          118,
          139,
          55,
          141,
          239
        ]
      }
    ],
    "events": [
      {
        "name": "contributionRecorded",
        "discriminator": [
          203,
          113,
          176,
          23,
          205,
          17,
          184,
          101
        ]
      },
      {
        "name": "contributorCreated",
        "discriminator": [
          112,
          14,
          50,
          216,
          129,
          42,
          60,
          64
        ]
      },
      {
        "name": "contributorPointsUpdated",
        "discriminator": [
          137,
          191,
          207,
          174,
          87,
          169,
          86,
          214
        ]
      },
      {
        "name": "monthlyPointsCalculated",
        "discriminator": [
          228,
          74,
          231,
          225,
          222,
          79,
          77,
          114
        ]
      },
      {
        "name": "programInitialized",
        "discriminator": [
          43,
          70,
          110,
          241,
          199,
          218,
          221,
          245
        ]
      },
      {
        "name": "reserveDeposit",
        "discriminator": [
          199,
          40,
          176,
          78,
          52,
          0,
          184,
          137
        ]
      },
      {
        "name": "reserveTransfer",
        "discriminator": [
          176,
          140,
          218,
          46,
          236,
          248,
          164,
          155
        ]
      },
      {
        "name": "tokensDistributed",
        "discriminator": [
          117,
          252,
          224,
          3,
          212,
          156,
          207,
          43
        ]
      },
      {
        "name": "aixblock_rewards::instructions::manage_reserve::ReserveConfigUpdated",
        "discriminator": [
          137,
          71,
          35,
          179,
          205,
          230,
          29,
          133
        ]
      },
      {
        "name": "aixblock_rewards::instructions::update_reserve::ReserveConfigUpdated",
        "discriminator": [
          137,
          71,
          35,
          179,
          205,
          230,
          29,
          133
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "invalidContributionAmount",
        "msg": "Contribution amount must be greater than zero"
      },
      {
        "code": 6001,
        "name": "invalidPointsCalculation",
        "msg": "Invalid points calculation"
      },
      {
        "code": 6002,
        "name": "insufficientBalance",
        "msg": "Insufficient token balance for distribution"
      },
      {
        "code": 6003,
        "name": "distributionPeriodNotEnded",
        "msg": "Distribution period not ended"
      },
      {
        "code": 6004,
        "name": "contributorNotFound",
        "msg": "Contributor not found"
      },
      {
        "code": 6005,
        "name": "unauthorized",
        "msg": "Unauthorized access"
      },
      {
        "code": 6006,
        "name": "invalidContributionType",
        "msg": "Invalid contribution type"
      },
      {
        "code": 6007,
        "name": "distributionAlreadyProcessed",
        "msg": "Monthly distribution already processed"
      },
      {
        "code": 6008,
        "name": "belowDistributionThreshold",
        "msg": "Below minimum threshold for distribution"
      },
      {
        "code": 6009,
        "name": "reserveCalculationError",
        "msg": "Reserve calculation error"
      }
    ],
    "types": [
      {
        "name": "contribution",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "contributionType",
              "type": {
                "defined": {
                  "name": "contributionType"
                }
              }
            },
            {
              "name": "points",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "metadata",
              "type": {
                "array": [
                  "u8",
                  32
                ]
              }
            },
            {
              "name": "isVerified",
              "type": "bool"
            },
            {
              "name": "period",
              "type": "u16"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "contributionRecorded",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "contributionType",
              "type": {
                "defined": {
                  "name": "contributionType"
                }
              }
            },
            {
              "name": "points",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "period",
              "type": "u16"
            }
          ]
        }
      },
      {
        "name": "contributionType",
        "type": {
          "kind": "enum",
          "variants": [
            {
              "name": "code"
            },
            {
              "name": "review"
            },
            {
              "name": "documentation"
            },
            {
              "name": "community"
            },
            {
              "name": "other"
            },
            {
              "name": "testing"
            },
            {
              "name": "bugReport"
            },
            {
              "name": "pullRequest"
            },
            {
              "name": "codeCommit"
            },
            {
              "name": "codeReview"
            }
          ]
        }
      },
      {
        "name": "contributor",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "totalPoints",
              "type": "u64"
            },
            {
              "name": "currentMonthPoints",
              "type": "u64"
            },
            {
              "name": "tokensClaimed",
              "type": "u64"
            },
            {
              "name": "lastClaimTime",
              "type": "i64"
            },
            {
              "name": "contributionCount",
              "type": "u32"
            },
            {
              "name": "isVerified",
              "type": "bool"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "contributorCreated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "contributorPointsUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "totalPoints",
              "type": "u64"
            },
            {
              "name": "period",
              "type": "u16"
            }
          ]
        }
      },
      {
        "name": "distributionPeriod",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "period",
              "type": "u16"
            },
            {
              "name": "totalTokens",
              "type": "u64"
            },
            {
              "name": "tokensDistributed",
              "type": "u64"
            },
            {
              "name": "totalPoints",
              "type": "u64"
            },
            {
              "name": "isCompleted",
              "type": "bool"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "initializeArgs",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "monthlyThreshold",
              "type": "u64"
            },
            {
              "name": "reserveRatio",
              "type": "u16"
            },
            {
              "name": "maxPointsPerType",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "monthlyPointsCalculated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "period",
              "type": "u16"
            },
            {
              "name": "totalPoints",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "meetsThreshold",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "pointsConfig",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "monthlyThreshold",
              "type": "u64"
            },
            {
              "name": "maxPointsPerType",
              "type": "u64"
            },
            {
              "name": "reserveRatio",
              "type": "u16"
            },
            {
              "name": "currentPeriod",
              "type": "u16"
            },
            {
              "name": "periodTotalPoints",
              "type": "u64"
            },
            {
              "name": "lastCalculationTime",
              "type": "i64"
            },
            {
              "name": "bump",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "programInitialized",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "monthlyThreshold",
              "type": "u64"
            },
            {
              "name": "reserveRatio",
              "type": "u16"
            },
            {
              "name": "maxPointsPerType",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "reserveDeposit",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "newReserveBalance",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "reserveTransfer",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "fromReserve",
              "type": "pubkey"
            },
            {
              "name": "toDistribution",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "tokensDistributed",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "period",
              "type": "u16"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "aixblock_rewards::instructions::manage_reserve::ReserveConfigUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "reserveRatio",
              "type": "u16"
            },
            {
              "name": "monthlyThreshold",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "aixblock_rewards::instructions::update_reserve::ReserveConfigUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "reserveRatio",
              "type": "u16"
            },
            {
              "name": "monthlyThreshold",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      }
    ]
  };
  