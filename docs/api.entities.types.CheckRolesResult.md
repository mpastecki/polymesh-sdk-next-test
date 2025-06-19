# Interface: CheckRolesResult

[api/entities/types](../wiki/api.entities.types).CheckRolesResult

Result of a `checkRoles` call

## Table of contents

### Properties

- [message](../wiki/api.entities.types.CheckRolesResult#message)
- [missingRoles](../wiki/api.entities.types.CheckRolesResult#missingroles)
- [result](../wiki/api.entities.types.CheckRolesResult#result)

## Properties

### message

• `Optional` **message**: `string`

optional message explaining the reason for failure in special cases

#### Defined in

[api/entities/types.ts:717](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L717)

___

### missingRoles

• `Optional` **missingRoles**: [`Role`](../wiki/api.procedures.types#role)[]

required roles which the Identity *DOESN'T* have. Only present if `result` is `false`

#### Defined in

[api/entities/types.ts:709](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L709)

___

### result

• **result**: `boolean`

whether the signer possesses all the required roles or not

#### Defined in

[api/entities/types.ts:713](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L713)
