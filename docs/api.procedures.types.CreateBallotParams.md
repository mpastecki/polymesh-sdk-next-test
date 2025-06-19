# Interface: CreateBallotParams

[api/procedures/types](../wiki/api.procedures.types).CreateBallotParams

## Table of contents

### Properties

- [declarationDate](../wiki/api.procedures.types.CreateBallotParams#declarationdate)
- [description](../wiki/api.procedures.types.CreateBallotParams#description)
- [endDate](../wiki/api.procedures.types.CreateBallotParams#enddate)
- [meta](../wiki/api.procedures.types.CreateBallotParams#meta)
- [rcv](../wiki/api.procedures.types.CreateBallotParams#rcv)
- [startDate](../wiki/api.procedures.types.CreateBallotParams#startdate)
- [targets](../wiki/api.procedures.types.CreateBallotParams#targets)

## Properties

### declarationDate

• **declarationDate**: `Date`

Date on which the Corporate Action is declared

#### Defined in

[api/procedures/types.ts:1879](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1879)

___

### description

• **description**: `string`

Description of the Corporate Action to which the Ballot is attached

#### Defined in

[api/procedures/types.ts:1867](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1867)

___

### endDate

• **endDate**: `Date`

Date when Ballot voting ends

#### Defined in

[api/procedures/types.ts:1862](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1862)

___

### meta

• **meta**: [`BallotMeta`](../wiki/api.entities.CorporateBallot.types.BallotMeta)

Title and motions of the Ballot

#### Defined in

[api/procedures/types.ts:1852](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1852)

___

### rcv

• **rcv**: `boolean`

Specifies whether Ranked Choice Voting (RCV) is enabled for this ballot.

#### Defined in

[api/procedures/types.ts:1884](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1884)

___

### startDate

• **startDate**: `Date`

Date when Ballot voting starts

#### Defined in

[api/procedures/types.ts:1857](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1857)

___

### targets

• `Optional` **targets**: [`InputCorporateActionTargets`](../wiki/api.procedures.types#inputcorporateactiontargets)

Asset Holder Identities to be included (or excluded) from the Ballot. Inclusion/exclusion is controlled by the `treatment`
  property. When the value is `Include`, all Asset Holders not present in the array are excluded, and vice-versa. If no value is passed,
  the default value for the Asset is used. If there is no default value, all Asset Holders will be part of the Ballot

#### Defined in

[api/procedures/types.ts:1874](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1874)
