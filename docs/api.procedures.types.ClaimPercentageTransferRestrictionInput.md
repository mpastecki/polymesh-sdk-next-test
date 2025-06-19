# Interface: ClaimPercentageTransferRestrictionInput

[api/procedures/types](../wiki/api.procedures.types).ClaimPercentageTransferRestrictionInput

## Hierarchy

- `TransferRestrictionInputBase`

  ↳ **`ClaimPercentageTransferRestrictionInput`**

## Table of contents

### Properties

- [claim](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#claim)
- [exemptedIdentities](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#exemptedidentities)
- [issuer](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#issuer)
- [max](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#max)
- [min](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#min)
- [skipStatIsEnabledCheck](../wiki/api.procedures.types.ClaimPercentageTransferRestrictionInput#skipstatisenabledcheck)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

#### Defined in

[api/procedures/types.ts:565](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L565)

___

### exemptedIdentities

• `Optional` **exemptedIdentities**: (`string` \| [`Identity`](../wiki/api.entities.Identity.Identity))[]

array of Identities (or DIDs) that are exempted from the Restriction

#### Inherited from

TransferRestrictionInputBase.exemptedIdentities

#### Defined in

[api/procedures/types.ts:534](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L534)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/procedures/types.ts:564](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L564)

___

### max

• **max**: `BigNumber`

#### Defined in

[api/procedures/types.ts:563](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L563)

___

### min

• **min**: `BigNumber`

#### Defined in

[api/procedures/types.ts:562](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L562)

___

### skipStatIsEnabledCheck

• `Optional` **skipStatIsEnabledCheck**: `boolean`

(optional) Set to `true` to skip stat is enabled check, useful for batch transactions

#### Inherited from

TransferRestrictionInputBase.skipStatIsEnabledCheck

#### Defined in

[api/procedures/types.ts:538](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L538)
