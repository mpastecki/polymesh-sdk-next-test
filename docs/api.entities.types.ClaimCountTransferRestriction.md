# Interface: ClaimCountTransferRestriction

[api/entities/types](../wiki/api.entities.types).ClaimCountTransferRestriction

## Hierarchy

- `TransferRestrictionBase`

  ↳ **`ClaimCountTransferRestriction`**

## Table of contents

### Properties

- [claim](../wiki/api.entities.types.ClaimCountTransferRestriction#claim)
- [exemptedIds](../wiki/api.entities.types.ClaimCountTransferRestriction#exemptedids)
- [issuer](../wiki/api.entities.types.ClaimCountTransferRestriction#issuer)
- [max](../wiki/api.entities.types.ClaimCountTransferRestriction#max)
- [min](../wiki/api.entities.types.ClaimCountTransferRestriction#min)

## Properties

### claim

• **claim**: [`InputStatClaim`](../wiki/api.entities.types#inputstatclaim)

The type of investors this restriction applies to. e.g. non-accredited

#### Defined in

[api/entities/types.ts:515](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L515)

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

[api/entities/types.ts:525](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L525)

___

### max

• `Optional` **max**: `BigNumber`

The maximum amount of investors that must meet the Claim criteria

#### Defined in

[api/entities/types.ts:523](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L523)

___

### min

• **min**: `BigNumber`

The minimum amount of investors the must meet the Claim criteria

#### Defined in

[api/entities/types.ts:519](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L519)
