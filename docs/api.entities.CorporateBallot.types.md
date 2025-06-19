# Module: api/entities/CorporateBallot/types

## Table of contents

### Enumerations

- [CorporateBallotStatus](../wiki/api.entities.CorporateBallot.types.CorporateBallotStatus)

### Interfaces

- [BallotMeta](../wiki/api.entities.CorporateBallot.types.BallotMeta)
- [BallotMotion](../wiki/api.entities.CorporateBallot.types.BallotMotion)
- [CorporateBallotDetails](../wiki/api.entities.CorporateBallot.types.CorporateBallotDetails)

### Type Aliases

- [BallotVote](../wiki/api.entities.CorporateBallot.types#ballotvote)
- [ChoiceWithParticipation](../wiki/api.entities.CorporateBallot.types#choicewithparticipation)
- [CorporateBallotMetaWithResults](../wiki/api.entities.CorporateBallot.types#corporateballotmetawithresults)
- [CorporateBallotMotionWithParticipation](../wiki/api.entities.CorporateBallot.types#corporateballotmotionwithparticipation)
- [CorporateBallotMotionWithResults](../wiki/api.entities.CorporateBallot.types#corporateballotmotionwithresults)
- [CorporateBallotWithParticipation](../wiki/api.entities.CorporateBallot.types#corporateballotwithparticipation)

## Type Aliases

### BallotVote

Ƭ **BallotVote**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `fallback?` | `BigNumber` | The fallback vote to be used if the choice is not found in the ballot. **`Note`** This is only allowed for RCV ballots. **`Note`** Must point to a choice in a motion (index of the choice in the motion choices array) **`Note`** Must not point to the same choice as the `vote` property (index != choiceIndex) |
| `power` | `BigNumber` | The power of the vote. |

#### Defined in

[api/entities/CorporateBallot/types.ts:21](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L21)

___

### ChoiceWithParticipation

Ƭ **ChoiceWithParticipation**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `choice` | `string` | The choice of the motion for which the votes are cast |
| `fallback?` | `BigNumber` | The fallback choice for the vote |
| `power` | `BigNumber` | The power of the vote |

#### Defined in

[api/entities/CorporateBallot/types.ts:110](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L110)

___

### CorporateBallotMetaWithResults

Ƭ **CorporateBallotMetaWithResults**: `Omit`\<[`BallotMeta`](../wiki/api.entities.CorporateBallot.types.BallotMeta), ``"motions"``\> & \{ `motions`: [`CorporateBallotMotionWithResults`](../wiki/api.entities.CorporateBallot.types#corporateballotmotionwithresults)[]  }

#### Defined in

[api/entities/CorporateBallot/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L103)

___

### CorporateBallotMotionWithParticipation

Ƭ **CorporateBallotMotionWithParticipation**: `Pick`\<[`BallotMotion`](../wiki/api.entities.CorporateBallot.types.BallotMotion), ``"title"`` \| ``"infoLink"``\> & \{ `choices`: [`ChoiceWithParticipation`](../wiki/api.entities.CorporateBallot.types#choicewithparticipation)[]  }

#### Defined in

[api/entities/CorporateBallot/types.ts:127](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L127)

___

### CorporateBallotMotionWithResults

Ƭ **CorporateBallotMotionWithResults**: `Pick`\<[`BallotMotion`](../wiki/api.entities.CorporateBallot.types.BallotMotion), ``"title"`` \| ``"infoLink"``\> & \{ `choices`: `ChoiceWithVotes`[] ; `total`: `BigNumber`  }

#### Defined in

[api/entities/CorporateBallot/types.ts:91](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L91)

___

### CorporateBallotWithParticipation

Ƭ **CorporateBallotWithParticipation**: `Omit`\<[`BallotMeta`](../wiki/api.entities.CorporateBallot.types.BallotMeta), ``"motions"``\> & \{ `motions`: [`CorporateBallotMotionWithParticipation`](../wiki/api.entities.CorporateBallot.types#corporateballotmotionwithparticipation)[]  }

#### Defined in

[api/entities/CorporateBallot/types.ts:134](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/CorporateBallot/types.ts#L134)
