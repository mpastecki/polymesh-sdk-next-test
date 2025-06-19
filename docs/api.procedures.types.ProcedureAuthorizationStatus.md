# Interface: ProcedureAuthorizationStatus

[api/procedures/types](../wiki/api.procedures.types).ProcedureAuthorizationStatus

## Table of contents

### Properties

- [accountFrozen](../wiki/api.procedures.types.ProcedureAuthorizationStatus#accountfrozen)
- [agentPermissions](../wiki/api.procedures.types.ProcedureAuthorizationStatus#agentpermissions)
- [noIdentity](../wiki/api.procedures.types.ProcedureAuthorizationStatus#noidentity)
- [roles](../wiki/api.procedures.types.ProcedureAuthorizationStatus#roles)
- [signerPermissions](../wiki/api.procedures.types.ProcedureAuthorizationStatus#signerpermissions)

## Properties

### accountFrozen

• **accountFrozen**: `boolean`

whether the Account is frozen (i.e. can't perform any transactions)

#### Defined in

[api/procedures/types.ts:85](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L85)

___

### agentPermissions

• **agentPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Identity`](../wiki/api.entities.types.SignerType#identity)\>

whether the Identity complies with all required Agent permissions

#### Defined in

[api/procedures/types.ts:73](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L73)

___

### noIdentity

• **noIdentity**: `boolean`

true only if the Procedure requires an Identity but the signing Account
  doesn't have one associated

#### Defined in

[api/procedures/types.ts:90](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L90)

___

### roles

• **roles**: [`CheckRolesResult`](../wiki/api.entities.types.CheckRolesResult)

whether the Identity complies with all required Roles

#### Defined in

[api/procedures/types.ts:81](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L81)

___

### signerPermissions

• **signerPermissions**: [`CheckPermissionsResult`](../wiki/api.entities.types.CheckPermissionsResult)\<[`Account`](../wiki/api.entities.types.SignerType#account)\>

whether the Account complies with all required Signer permissions

#### Defined in

[api/procedures/types.ts:77](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L77)
