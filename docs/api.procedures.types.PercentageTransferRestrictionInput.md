# Interface: PercentageTransferRestrictionInput

[api/procedures/types](../wiki/api.procedures.types).PercentageTransferRestrictionInput

## Hierarchy

- `TransferRestrictionInputBase`

  ↳ **`PercentageTransferRestrictionInput`**

## Table of contents

### Properties

- [exemptedIdentities](../wiki/api.procedures.types.PercentageTransferRestrictionInput#exemptedidentities)
- [percentage](../wiki/api.procedures.types.PercentageTransferRestrictionInput#percentage)
- [skipStatIsEnabledCheck](../wiki/api.procedures.types.PercentageTransferRestrictionInput#skipstatisenabledcheck)

## Properties

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:534](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L534)

___

### percentage

• **percentage**: `BigNumber`

maximum percentage (0-100) of the total supply of the Asset that can be held by a single investor at once

#### Defined in

[api/procedures/types.ts:552](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L552)

___

### skipStatIsEnabledCheck

• `Optional` **skipStatIsEnabledCheck**: `boolean`

(optional) Set to `true` to skip stat is enabled check, useful for batch transactions

#### Inherited from

TransferRestrictionInputBase.skipStatIsEnabledCheck

#### Defined in

[api/procedures/types.ts:538](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L538)
