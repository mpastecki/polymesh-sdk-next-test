# Interface: ResultSet\<T\>

[api/entities/types](../wiki/api.entities.types).ResultSet

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Properties

- [count](../wiki/api.entities.types.ResultSet#count)
- [data](../wiki/api.entities.types.ResultSet#data)
- [next](../wiki/api.entities.types.ResultSet#next)

## Properties

### count

• `Optional` **count**: `BigNumber`

**`Note`**

methods will have `count` defined when middleware is configured, but be undefined otherwise. This happens when the chain node is queried directly

#### Defined in

[api/entities/types.ts:107](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L107)

___

### data

• **data**: `T`[]

#### Defined in

[api/entities/types.ts:102](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L102)

___

### next

• **next**: [`NextKey`](../wiki/api.entities.types#nextkey)

#### Defined in

[api/entities/types.ts:103](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/entities/types.ts#L103)
