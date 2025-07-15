/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/jinai_here.json`.
 */
export type JinaiHere = {
  address: "Hqs1UsDrx9s79o2Jm1z9MZxoVsAb9uAU7YMDgWKAwX7G";
  metadata: {
    name: "jinaiHere";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "appointPool";
      discriminator: [176, 83, 41, 234, 132, 224, 44, 239];
      accounts: [
        {
          name: "globalState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "treasury";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "feeBasisPoints";
          type: "u16";
        }
      ];
    },
    {
      name: "createPool";
      discriminator: [233, 146, 209, 142, 207, 104, 64, 188];
      accounts: [
        {
          name: "globalState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "global_state.pool_count";
                account: "globalState";
              }
            ];
          };
        },
        {
          name: "creator";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "minDeposit";
          type: "u64";
        },
        {
          name: "endTime";
          type: "i64";
        },
        {
          name: "prizeDistribution";
          type: {
            array: ["u8", 4];
          };
        }
      ];
    },
    {
      name: "joinPool";
      discriminator: [14, 65, 62, 16, 116, 17, 195, 107];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "playerAuthority";
              }
            ];
          };
        },
        {
          name: "playerAuthority";
          writable: true;
          signer: true;
        },
        {
          name: "poolVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108, 45, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "depositAmount";
          type: "u64";
        }
      ];
    },
    {
      name: "securePool";
      discriminator: [214, 177, 243, 147, 133, 77, 230, 77];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "globalState";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "signer";
          writable: true;
          signer: true;
        }
      ];
      args: [];
    },
    {
      name: "setResults";
      discriminator: [143, 243, 140, 218, 119, 122, 177, 30];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "globalState";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "player1";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player1.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player2";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player2.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player3";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player3.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player4";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player4.player";
                account: "player";
              }
            ];
          };
        }
      ];
      args: [
        {
          name: "playerRanks";
          type: {
            array: ["u8", 4];
          };
        }
      ];
    },
    {
      name: "tRewards";
      discriminator: [28, 30, 134, 126, 50, 148, 206, 145];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "globalState";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "poolVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108, 45, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "treasury";
          writable: true;
        },
        {
          name: "player1";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player1.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player2";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player2.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player3";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player3.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "player4";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "player4.player";
                account: "player";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "uPrizes";
      discriminator: [83, 123, 85, 64, 12, 143, 169, 99];
      accounts: [
        {
          name: "pool";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "playerAuthority";
              }
            ];
          };
        },
        {
          name: "playerAuthority";
          writable: true;
          signer: true;
        },
        {
          name: "poolVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108, 45, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "vCancel";
      discriminator: [103, 216, 196, 237, 239, 158, 102, 250];
      accounts: [
        {
          name: "pool";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "globalState";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 108, 111, 98, 97, 108, 45, 115, 116, 97, 116, 101];
              }
            ];
          };
        },
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "poolVault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 111, 108, 45, 118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player1";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "pool.player_accounts [0]";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player2";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "pool.player_accounts [1]";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player3";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "pool.player_accounts [2]";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "player4";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 108, 97, 121, 101, 114];
              },
              {
                kind: "account";
                path: "pool.pool_id";
                account: "pool";
              },
              {
                kind: "account";
                path: "pool.player_accounts [3]";
                account: "pool";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "globalState";
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98];
    },
    {
      name: "player";
      discriminator: [205, 222, 112, 7, 165, 155, 206, 218];
    },
    {
      name: "pool";
      discriminator: [241, 154, 109, 4, 17, 177, 109, 188];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "poolFull";
      msg: "Pool is already full";
    },
    {
      code: 6001;
      name: "poolNotOpen";
      msg: "Pool is not open for new players";
    },
    {
      code: 6002;
      name: "poolNotCompleted";
      msg: "Pool has not been completed yet";
    },
    {
      code: 6003;
      name: "poolClosed";
      msg: "Pool has already ended";
    },
    {
      code: 6004;
      name: "invalidPoolStatus";
      msg: "Invalid pool status for this operation";
    },
    {
      code: 6005;
      name: "insufficientDeposit";
      msg: "Deposit amount is less than the minimum required";
    },
    {
      code: 6006;
      name: "alreadyClaimed";
      msg: "Player has already claimed their prize";
    },
    {
      code: 6007;
      name: "noPrize";
      msg: "Player has no prize to claim";
    },
    {
      code: 6008;
      name: "unauthorized";
      msg: "Unauthorized access";
    },
    {
      code: 6009;
      name: "invalidPlayerAccount";
      msg: "Invalid player account";
    },
    {
      code: 6010;
      name: "invalidPrizeDistribution";
      msg: "Prize distribution must add up to 90%";
    },
    {
      code: 6011;
      name: "invalidRank";
      msg: "Rank must be between 1 and 4";
    },
    {
      code: 6012;
      name: "duplicateRank";
      msg: "Each player must have a unique rank";
    },
    {
      code: 6013;
      name: "invalidTreasury";
      msg: "Invalid treasury account";
    },
    {
      code: 6014;
      name: "noFees";
      msg: "No fees available to withdraw";
    },
    {
      code: 6015;
      name: "playerAlreadyJoined";
      msg: "Player has already joined this pool";
    },
    {
      code: 6016;
      name: "maxPlayersReached";
      msg: "Maximum number of players reached";
    },
    {
      code: 6017;
      name: "noFundsInPool";
      msg: "Pool has not accumulated any funds";
    },
    {
      code: 6018;
      name: "noPlayersInPool";
      msg: "Cannot set results for a pool with no players";
    },
    {
      code: 6019;
      name: "playerMismatch";
      msg: "Provided player account does not match pool record";
    },
    {
      code: 6020;
      name: "calculationError";
      msg: "Calculation error during prize distribution";
    },
    {
      code: 6021;
      name: "invalidAuthority";
      msg: "Program authority does not match global state authority";
    },
    {
      code: 6022;
      name: "invalidEndTime";
      msg: "End time must be in the future";
    },
    {
      code: 6023;
      name: "playerNotFound";
      msg: "Cannot find a player with the specified account";
    },
    {
      code: 6024;
      name: "insufficientVaultFunds";
      msg: "Insufficient funds in pool vault";
    }
  ];
  types: [
    {
      name: "globalState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "poolCount";
            type: "u64";
          },
          {
            name: "treasury";
            type: "pubkey";
          },
          {
            name: "feeBasisPoints";
            type: "u16";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "player";
      type: {
        kind: "struct";
        fields: [
          {
            name: "player";
            type: "pubkey";
          },
          {
            name: "poolId";
            type: "u64";
          },
          {
            name: "depositAmount";
            type: "u64";
          },
          {
            name: "hasClaimed";
            type: "bool";
          },
          {
            name: "rank";
            type: "u8";
          },
          {
            name: "prizeAmount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "pool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "poolId";
            type: "u64";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "totalAmount";
            type: "u64";
          },
          {
            name: "status";
            type: {
              defined: {
                name: "poolStatus";
              };
            };
          },
          {
            name: "minDeposit";
            type: "u64";
          },
          {
            name: "currentPlayers";
            type: "u8";
          },
          {
            name: "maxPlayers";
            type: "u8";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "prizeDistribution";
            type: {
              array: ["u8", 4];
            };
          },
          {
            name: "feeAmount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "playerAccounts";
            type: {
              array: ["pubkey", 4];
            };
          }
        ];
      };
    },
    {
      name: "poolStatus";
      type: {
        kind: "enum";
        variants: [
          {
            name: "open";
          },
          {
            name: "inProgress";
          },
          {
            name: "completed";
          },
          {
            name: "cancelled";
          }
        ];
      };
    }
  ];
};
