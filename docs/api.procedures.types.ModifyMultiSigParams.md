# Interface: ModifyMultiSigParams

[api/procedures/types](../wiki/api.procedures.types).ModifyMultiSigParams

## Table of contents

### Properties

- [multiSig](../wiki/api.procedures.types.ModifyMultiSigParams#multisig)
- [requiredSignatures](../wiki/api.procedures.types.ModifyMultiSigParams#requiredsignatures)
- [signers](../wiki/api.procedures.types.ModifyMultiSigParams#signers)

## Properties

### multiSig

• **multiSig**: [`MultiSig`](../wiki/api.entities.Account.MultiSig.MultiSig)

The MultiSig to be modified

#### Defined in

[api/procedures/types.ts:1687](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1687)

___

### requiredSignatures

• `Optional` **requiredSignatures**: `BigNumber`

The required number of signatures for the MultiSig

#### Defined in

[api/procedures/types.ts:1695](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1695)

___

### signers

• `Optional` **signers**: [`Account`](../wiki/api.entities.Account.Account)[]

The signer accounts to set for the MultiSig

#### Defined in

[api/procedures/types.ts:1691](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L1691)
