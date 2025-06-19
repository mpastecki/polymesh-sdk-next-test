# Class: TransferRestrictions

[api/entities/Asset/Fungible/TransferRestrictions](../wiki/api.entities.Asset.Fungible.TransferRestrictions).TransferRestrictions

Handles all Asset Transfer Restrictions related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`TransferRestrictions`**

## Table of contents

### Properties

- [claimCount](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions#claimcount)
- [claimPercentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions#claimpercentage)
- [count](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions#count)
- [percentage](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions#percentage)

### Methods

- [getValues](../wiki/api.entities.Asset.Fungible.TransferRestrictions.TransferRestrictions#getvalues)

## Properties

### claimCount

• **claimCount**: [`ClaimCount`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimCount.ClaimCount)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/index.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L29)

___

### claimPercentage

• **claimPercentage**: [`ClaimPercentage`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.ClaimPercentage.ClaimPercentage)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/index.ts:30](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L30)

___

### count

• **count**: [`Count`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Count.Count)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/index.ts:27](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L27)

___

### percentage

• **percentage**: [`Percentage`](../wiki/api.entities.Asset.Fungible.TransferRestrictions.Percentage.Percentage)

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/index.ts:28](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L28)

## Methods

### getValues

▸ **getValues**(): `Promise`\<[`TransferRestrictionValues`](../wiki/api.entities.Asset.types.TransferRestrictionValues)[]\>

Get the values of all active transfer restrictions for this Asset

#### Returns

`Promise`\<[`TransferRestrictionValues`](../wiki/api.entities.Asset.types.TransferRestrictionValues)[]\>

an array of objects containing the values of all active transfer restrictions for this Asset

#### Defined in

[api/entities/Asset/Fungible/TransferRestrictions/index.ts:48](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/TransferRestrictions/index.ts#L48)
