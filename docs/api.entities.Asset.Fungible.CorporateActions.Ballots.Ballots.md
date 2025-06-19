# Class: Ballots

[api/entities/Asset/Fungible/CorporateActions/Ballots](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots).Ballots

Handles all Asset Ballots related functionality

## Hierarchy

- `Namespace`\<[`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)\>

  ↳ **`Ballots`**

## Table of contents

### Methods

- [create](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots.Ballots#create)
- [get](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots.Ballots#get)
- [getOne](../wiki/api.entities.Asset.Fungible.CorporateActions.Ballots.Ballots#getone)

## Methods

### create

▸ **create**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails), [`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)\>\>

Create a Ballot for an Asset

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CreateBallotParams`](../wiki/api.procedures.types.CreateBallotParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails), [`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [create.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Ballots.ts:29](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L29)

___

### get

▸ **get**(): `Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)[]\>

Retrieve all Ballots associated to this Asset

#### Returns

`Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)[]\>

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Ballots.ts:78](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L78)

___

### getOne

▸ **getOne**(`args`): `Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)\>

Retrieve a single Ballot associated to this Asset by its ID

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.id` | `BigNumber` |

#### Returns

`Promise`\<[`CorporateBallotWithDetails`](../wiki/api.entities.types.CorporateBallotWithDetails)\>

**`Throws`**

if there is no Ballot assigned to the provided Corporate Action with the passed ID

**`Throws`**

if the provided Corporate Action does not exist

#### Defined in

[api/entities/Asset/Fungible/CorporateActions/Ballots.ts:51](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Asset/Fungible/CorporateActions/Ballots.ts#L51)
