# Interface: ClaimPercentageTransferRestriction

[api/entities/types](../wiki/api.entities.types).ClaimPercentageTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`ClaimPercentageTransferRestriction`**

## Table of contents

### Properties

- [claim](../wiki/api.entities.types.ClaimPercentageTransferRestriction#claim)
- [exemptedIds](../wiki/api.entities.types.ClaimPercentageTransferRestriction#exemptedids)
- [issuer](../wiki/api.entities.types.ClaimPercentageTransferRestriction#issuer)
- [max](../wiki/api.entities.types.ClaimPercentageTransferRestriction#max)
- [min](../wiki/api.entities.types.ClaimPercentageTransferRestriction#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

The type of investors this restriction applies to. e.g. Canadian investor

#### Defined in

[api/entities/types.ts:531](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L531)

___

### exemptedIds

• `Optional` **exemptedIds**: `string`[]

array of Identity IDs that are exempted from the Restriction

#### Inherited from

TransferRestrictionBase.exemptedIds

#### Defined in

[api/entities/types.ts:498](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L498)

___

### issuer

• **issuer**: [`Identity`](../wiki/api.entities.Identity.Identity)

#### Defined in

[api/entities/types.ts:541](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L541)

___

### max

• **max**: `BigNumber`

The maximum percentage of the total supply that investors meeting the Claim criteria must hold

#### Defined in

[api/entities/types.ts:539](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L539)

___

### min

• **min**: `BigNumber`

The minimum percentage of the total supply that investors meeting the Claim criteria must hold

#### Defined in

[api/entities/types.ts:535](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L535)
