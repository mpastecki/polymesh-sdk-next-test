# Interface: SectionPermissions\<T\>

[api/entities/types](../wiki/api.entities.types).SectionPermissions

Signer/agent permissions for a specific type

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | type of Permissions (Asset, Transaction, Portfolio, etc) |

## Hierarchy

- **`SectionPermissions`**

  ↳ [`TransactionPermissions`](../wiki/api.entities.types.TransactionPermissions)

## Table of contents

### Properties

- [type](../wiki/api.entities.types.SectionPermissions#type)
- [values](../wiki/api.entities.types.SectionPermissions#values)

## Properties

### type

• **type**: [`PermissionType`](../wiki/api.entities.types.PermissionType)

Whether the permissions are inclusive or exclusive

#### Defined in

[api/entities/types.ts:629](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L629)

___

### values

• **values**: `T`[]

Values to be included/excluded

#### Defined in

[api/entities/types.ts:625](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L625)
