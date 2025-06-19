# Interface: CorporateBallotDetails

[api/entities/CorporateBallot/types](../wiki/api.entities.CorporateBallot.types).CorporateBallotDetails

## Table of contents

### Properties

- [endDate](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails#enddate)
- [meta](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails#meta)
- [rcv](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails#rcv)
- [startDate](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails#startdate)

## Properties

### endDate

• **endDate**: `Date`

end date of the ballot

#### Defined in

[api/entities/CorporateBallot/types.ts:57](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L57)

___

### meta

• **meta**: [`BallotMeta`](../wiki/api.entities.CorporateBallot.types.BallotMeta)

meta data for the ballot

#### Defined in

[api/entities/CorporateBallot/types.ts:62](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L62)

___

### rcv

• **rcv**: `boolean`

whether Ranked-Choice Voting (RCV) has been enabled

Ranked-Choice Voting allows voters to select a fallback choice should their first
preference fail to reach a certain threshold or e.g., be eliminated in the top-2 run-off. whether rcv voting has been enabled

#### Defined in

[api/entities/CorporateBallot/types.ts:70](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L70)

___

### startDate

• **startDate**: `Date`

start date of the ballot

#### Defined in

[api/entities/CorporateBallot/types.ts:52](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L52)
