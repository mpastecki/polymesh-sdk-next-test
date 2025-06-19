# Interface: SetStakingPayeeParams

[api/procedures/types](../wiki/api.procedures.types).SetStakingPayeeParams

## Table of contents

### Properties

- [autoStake](../wiki/api.procedures.types.SetStakingPayeeParams#autostake)
- [payee](../wiki/api.procedures.types.SetStakingPayeeParams#payee)

## Properties

### autoStake

• **autoStake**: `boolean`

If set to true then rewards will be auto staked in order to compound

**`Note`**

The payee must be the stash account in order to auto stake

#### Defined in

[api/procedures/types.ts:1834](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1834)

___

### payee

• **payee**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

The account who will receive the staking rewards

#### Defined in

[api/procedures/types.ts:1828](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1828)
