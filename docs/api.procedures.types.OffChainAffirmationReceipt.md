# Interface: OffChainAffirmationReceipt

[api/procedures/types](../wiki/api.procedures.types).OffChainAffirmationReceipt

## Table of contents

### Properties

- [legId](../wiki/api.procedures.types.OffChainAffirmationReceipt#legid)
- [metadata](../wiki/api.procedures.types.OffChainAffirmationReceipt#metadata)
- [signature](../wiki/api.procedures.types.OffChainAffirmationReceipt#signature)
- [signer](../wiki/api.procedures.types.OffChainAffirmationReceipt#signer)
- [uid](../wiki/api.procedures.types.OffChainAffirmationReceipt#uid)

## Properties

### legId

• **legId**: `BigNumber`

Index of the off chain leg within the instruction to be affirmed

#### Defined in

[api/procedures/types.ts:1072](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1072)

___

### metadata

• `Optional` **metadata**: `string`

(optional) Metadata value that can be used to attach messages to the receipt

#### Defined in

[api/procedures/types.ts:1084](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1084)

___

### signature

• **signature**: [`OffChainSignature`](../wiki/api.procedures.types.OffChainSignature)

Signature confirming the receipt details

#### Defined in

[api/procedures/types.ts:1080](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1080)

___

### signer

• **signer**: `string` \| [`Account`](../wiki/api.entities.Account.Account)

Signer of this receipt

#### Defined in

[api/procedures/types.ts:1076](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1076)

___

### uid

• **uid**: `BigNumber`

Unique receipt number set by the signer for their receipts

#### Defined in

[api/procedures/types.ts:1068](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1068)
