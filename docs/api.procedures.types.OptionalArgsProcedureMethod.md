# Interface: OptionalArgsProcedureMethod\<MethodArgs, ProcedureReturnValue, ReturnValue\>

[api/procedures/types](../wiki/api.procedures.types).OptionalArgsProcedureMethod

## Type parameters

| Name | Type |
| :------ | :------ |
| `MethodArgs` | `MethodArgs` |
| `ProcedureReturnValue` | `ProcedureReturnValue` |
| `ReturnValue` | `ProcedureReturnValue` |

## Callable

### OptionalArgsProcedureMethod

▸ **OptionalArgsProcedureMethod**(`args?`, `opts?`): `Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

#### Returns

`Promise`\<[`GenericPolymeshTransaction`](../wiki/api.procedures.types#genericpolymeshtransaction)\<`ProcedureReturnValue`, `ReturnValue`\>\>

#### Defined in

[api/procedures/types.ts:213](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L213)

## Table of contents

### Properties

- [checkAuthorization](../wiki/api.procedures.types.OptionalArgsProcedureMethod#checkauthorization)

## Properties

### checkAuthorization

• **checkAuthorization**: (`args?`: `MethodArgs`, `opts?`: [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts)) => `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

#### Type declaration

▸ (`args?`, `opts?`): `Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `args?` | `MethodArgs` |
| `opts?` | [`ProcedureOpts`](../wiki/api.procedures.types.ProcedureOpts) |

##### Returns

`Promise`\<[`ProcedureAuthorizationStatus`](../wiki/api.procedures.types.ProcedureAuthorizationStatus)\>

#### Defined in

[api/procedures/types.ts:216](https://github.com/PolymeshAssociation/polymesh-sdk/blob/8a9e72221/src/api/procedures/types.ts#L216)
