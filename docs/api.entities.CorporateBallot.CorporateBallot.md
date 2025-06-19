# Class: CorporateBallot

[api/entities/CorporateBallot](../wiki/api.entities.CorporateBallot).CorporateBallot

Represents a Ballot

## Hierarchy

- [`CorporateActionBase`](../wiki/api.entities.CorporateActionBase.CorporateActionBase)

  ↳ **`CorporateBallot`**

## Table of contents

### Properties

- [asset](../wiki/api.entities.CorporateBallot.CorporateBallot#asset)
- [declarationDate](../wiki/api.entities.CorporateBallot.CorporateBallot#declarationdate)
- [defaultTaxWithholding](../wiki/api.entities.CorporateBallot.CorporateBallot#defaulttaxwithholding)
- [description](../wiki/api.entities.CorporateBallot.CorporateBallot#description)
- [id](../wiki/api.entities.CorporateBallot.CorporateBallot#id)
- [targets](../wiki/api.entities.CorporateBallot.CorporateBallot#targets)
- [taxWithholdings](../wiki/api.entities.CorporateBallot.CorporateBallot#taxwithholdings)
- [uuid](../wiki/api.entities.CorporateBallot.CorporateBallot#uuid)

### Methods

- [checkpoint](../wiki/api.entities.CorporateBallot.CorporateBallot#checkpoint)
- [details](../wiki/api.entities.CorporateBallot.CorporateBallot#details)
- [exists](../wiki/api.entities.CorporateBallot.CorporateBallot#exists)
- [isEqual](../wiki/api.entities.CorporateBallot.CorporateBallot#isequal)
- [linkDocuments](../wiki/api.entities.CorporateBallot.CorporateBallot#linkdocuments)
- [modifyCheckpoint](../wiki/api.entities.CorporateBallot.CorporateBallot#modifycheckpoint)
- [remove](../wiki/api.entities.CorporateBallot.CorporateBallot#remove)
- [results](../wiki/api.entities.CorporateBallot.CorporateBallot#results)
- [status](../wiki/api.entities.CorporateBallot.CorporateBallot#status)
- [toHuman](../wiki/api.entities.CorporateBallot.CorporateBallot#tohuman)
- [vote](../wiki/api.entities.CorporateBallot.CorporateBallot#vote)
- [votesByIdentity](../wiki/api.entities.CorporateBallot.CorporateBallot#votesbyidentity)
- [generateUuid](../wiki/api.entities.CorporateBallot.CorporateBallot#generateuuid)
- [unserialize](../wiki/api.entities.CorporateBallot.CorporateBallot#unserialize)

## Properties

### asset

• **asset**: [`FungibleAsset`](../wiki/api.entities.Asset.Fungible.FungibleAsset)

Asset affected by this Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[asset](../wiki/api.entities.CorporateActionBase.CorporateActionBase#asset)

#### Defined in

[api/entities/CorporateActionBase/index.ts:80](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L80)

___

### declarationDate

• **declarationDate**: `Date`

date at which the Corporate Action was created

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[declarationDate](../wiki/api.entities.CorporateActionBase.CorporateActionBase#declarationdate)

#### Defined in

[api/entities/CorporateActionBase/index.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L85)

___

### defaultTaxWithholding

• **defaultTaxWithholding**: `BigNumber`

default percentage (0-100) of tax withholding for this Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[defaultTaxWithholding](../wiki/api.entities.CorporateActionBase.CorporateActionBase#defaulttaxwithholding)

#### Defined in

[api/entities/CorporateActionBase/index.ts:101](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L101)

___

### description

• **description**: `string`

brief text description of the Corporate Action

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[description](../wiki/api.entities.CorporateActionBase.CorporateActionBase#description)

#### Defined in

[api/entities/CorporateActionBase/index.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L90)

___

### id

• **id**: `BigNumber`

internal Corporate Action ID

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[id](../wiki/api.entities.CorporateActionBase.CorporateActionBase#id)

#### Defined in

[api/entities/CorporateActionBase/index.ts:75](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L75)

___

### targets

• **targets**: [`CorporateActionTargets`](../wiki/api.entities.CorporateActionBase.types.CorporateActionTargets)

Asset Holder Identities related to this Corporate action. If the treatment is `Exclude`, the Identities
  in the array will not be targeted by the Action, Identities not in the array will be targeted, and vice versa

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[targets](../wiki/api.entities.CorporateActionBase.CorporateActionBase#targets)

#### Defined in

[api/entities/CorporateActionBase/index.ts:96](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L96)

___

### taxWithholdings

• **taxWithholdings**: [`TaxWithholding`](../wiki/api.entities.CorporateActionBase.types.TaxWithholding)[]

percentage (0-100) of tax withholding per Identity. Any Identity not present
  in this array uses the default tax withholding percentage

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[taxWithholdings](../wiki/api.entities.CorporateActionBase.CorporateActionBase#taxwithholdings)

#### Defined in

[api/entities/CorporateActionBase/index.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L107)

___

### uuid

• **uuid**: `string`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[uuid](../wiki/api.entities.CorporateActionBase.CorporateActionBase#uuid)

#### Defined in

[api/entities/Entity.ts:46](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Entity.ts#L46)

## Methods

### checkpoint

▸ **checkpoint**(): `Promise`\<``null`` \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

Retrieve the Checkpoint associated with this Corporate Action. If the Checkpoint is scheduled and has
  not been created yet, the corresponding CheckpointSchedule is returned instead. A null value means
  the Corporate Action was created without an associated Checkpoint

#### Returns

`Promise`\<``null`` \| [`CheckpointSchedule`](../wiki/api.entities.CheckpointSchedule.CheckpointSchedule) \| [`Checkpoint`](../wiki/api.entities.Checkpoint.Checkpoint)\>

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[checkpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#checkpoint)

#### Defined in

[api/entities/CorporateActionBase/index.ts:191](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L191)

___

### details

▸ **details**(): `Promise`\<[`CorporateBallotDetails`](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails)\>

Retrieve details associated with this Ballot

#### Returns

`Promise`\<[`CorporateBallotDetails`](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails)\>

**`Throws`**

if the Ballot does not exist

#### Defined in

[api/entities/CorporateBallot/index.ts:136](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L136)

___

### exists

▸ **exists**(): `Promise`\<`boolean`\>

Determine whether this Ballot exists on chain

#### Returns

`Promise`\<`boolean`\>

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[exists](../wiki/api.entities.CorporateActionBase.CorporateActionBase#exists)

#### Defined in

[api/entities/CorporateBallot/index.ts:115](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L115)

___

### isEqual

▸ **isEqual**(`entity`): `boolean`

Determine whether this Entity is the same as another one

#### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [`Entity`](../wiki/api.entities.Entity.Entity)\<`unknown`, `unknown`\> |

#### Returns

`boolean`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[isEqual](../wiki/api.entities.CorporateActionBase.CorporateActionBase#isequal)

#### Defined in

[api/entities/Entity.ts:61](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Entity.ts#L61)

___

### linkDocuments

▸ **linkDocuments**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Link a list of documents to this corporate action

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`LinkCaDocsParams`](../wiki/api.procedures.types.LinkCaDocsParams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

any previous links are removed in favor of the new list

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [linkDocuments.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[linkDocuments](../wiki/api.entities.CorporateActionBase.CorporateActionBase#linkdocuments)

#### Defined in

[api/entities/CorporateActionBase/index.ts:160](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L160)

___

### modifyCheckpoint

▸ **modifyCheckpoint**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Modify the Corporate Ballot's Record Date

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `Object` |
| `args.checkpoint` | [`InputCaCheckpoint`](../wiki/api.entities.Asset.Fungible.Checkpoints.types#inputcacheckpoint) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [modifyCheckpoint.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Overrides

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[modifyCheckpoint](../wiki/api.entities.CorporateActionBase.CorporateActionBase#modifycheckpoint)

#### Defined in

[api/entities/CorporateBallot/index.ts:336](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L336)

___

### remove

▸ **remove**(`opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Remove the Ballot

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Note`**

deletes the corporate action with the associated ballot if ballot has not started

**`Throws`**

if ballot has already started

**`Throws`**

if ballot is not found

**`Note`**

this method is of type [NoArgsProcedureMethod](../wiki/api.procedures.types.NoArgsProcedureMethod), which means you can call [remove.checkAuthorization](../wiki/api.procedures.types.NoArgsProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/CorporateBallot/index.ts:308](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L308)

___

### results

▸ **results**(): `Promise`\<[`CorporateBallotMetaWithResults`](../wiki/api.entities.CorporateBallot.types#corporateballotmetawithresults)\>

Retrieve the results of the Ballot

#### Returns

`Promise`\<[`CorporateBallotMetaWithResults`](../wiki/api.entities.CorporateBallot.types#corporateballotmetawithresults)\>

**`Throws`**

if the Ballot does not exist

#### Defined in

[api/entities/CorporateBallot/index.ts:173](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L173)

___

### status

▸ **status**(): `Promise`\<[`CorporateBallotStatus`](../wiki/api.entities.CorporateBallot.types.CorporateBallotStatus)\>

Return the status of the Ballot

#### Returns

`Promise`\<[`CorporateBallotStatus`](../wiki/api.entities.CorporateBallot.types.CorporateBallotStatus)\>

**`Throws`**

if the Ballot does not exist

#### Defined in

[api/entities/CorporateBallot/index.ts:147](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L147)

___

### toHuman

▸ **toHuman**(): [`HumanReadable`](../wiki/api.entities.CorporateActionBase.HumanReadable)

Return the Corporate Action's static data

#### Returns

[`HumanReadable`](../wiki/api.entities.CorporateActionBase.HumanReadable)

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[toHuman](../wiki/api.entities.CorporateActionBase.CorporateActionBase#tohuman)

#### Defined in

[api/entities/CorporateActionBase/index.ts:271](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateActionBase/index.ts#L271)

___

### vote

▸ **vote**(`args`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

Cast a vote on the Ballot

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`CastBallotVoteParams`](../wiki/api.procedures.types#castballotvoteparams) |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`void`, `void`\>\>

**`Throws`**

if the Ballot does not exist

**`Throws`**

if the Ballot voting is not active

**`Throws`**

if the number of votes does not match the sum of all choices of all motions

**`Throws`**

if fallback votes are provided for a non-RCV Ballot

**`Throws`**

if vote does not point to the correct choice in motion

**`Throws`**

if the fallback vote is the same as the choice

**`Throws`**

if the fallback vote is not pointing to a choice in the motion

**`Note`**

this method is of type [ProcedureMethod](../wiki/api.procedures.types.ProcedureMethod), which means you can call [vote.checkAuthorization](../wiki/api.procedures.types.ProcedureMethod#checkauthorization)
  on it to see whether the signing Account and Identity have the required roles and permissions to run it

#### Defined in

[api/entities/CorporateBallot/index.ts:326](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L326)

___

### votesByIdentity

▸ **votesByIdentity**(`did`): `Promise`\<[`CorporateBallotWithParticipation`](../wiki/api.entities.CorporateBallot.types#corporateballotwithparticipation)\>

Retrieve the participation of the Ballot

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` \| [`Identity`](../wiki/api.entities.Identity.Identity) |

#### Returns

`Promise`\<[`CorporateBallotWithParticipation`](../wiki/api.entities.CorporateBallot.types#corporateballotwithparticipation)\>

**`Throws`**

if the Ballot does not exist

#### Defined in

[api/entities/CorporateBallot/index.ts:233](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/index.ts#L233)

___

### generateUuid

▸ `Static` **generateUuid**\<`Identifiers`\>(`identifiers`): `string`

Generate the Entity's UUID from its identifying properties

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `identifiers` | `Identifiers` |

#### Returns

`string`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[generateUuid](../wiki/api.entities.CorporateActionBase.CorporateActionBase#generateuuid)

#### Defined in

[api/entities/Entity.ts:14](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Entity.ts#L14)

___

### unserialize

▸ `Static` **unserialize**\<`Identifiers`\>(`serialized`): `Identifiers`

Unserialize a UUID into its Unique Identifiers

#### Type parameters

| Name |
| :------ |
| `Identifiers` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `serialized` | `string` | UUID to unserialize |

#### Returns

`Identifiers`

#### Inherited from

[CorporateActionBase](../wiki/api.entities.CorporateActionBase.CorporateActionBase).[unserialize](../wiki/api.entities.CorporateActionBase.CorporateActionBase#unserialize)

#### Defined in

[api/entities/Entity.ts:23](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/Entity.ts#L23)
