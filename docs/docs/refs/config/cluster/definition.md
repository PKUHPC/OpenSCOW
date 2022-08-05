## Untitled object in undefined Type

`object` ([Details](definition.md))

# Untitled object in undefined Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                  |
| :-------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------ |
| [displayName](#displayname) | `string`  | Required | cannot be null | [Untitled schema](definition-properties-displayname.md "undefined#/properties/displayName") |
| [scheduler](#scheduler)     | Merged    | Required | cannot be null | [Untitled schema](definition-properties-scheduler.md "undefined#/properties/scheduler")     |
| [slurm](#slurm)             | `object`  | Required | cannot be null | [Untitled schema](definition-properties-slurm.md "undefined#/properties/slurm")             |
| [misIgnore](#misignore)     | `boolean` | Required | cannot be null | [Untitled schema](definition-properties-misignore.md "undefined#/properties/misIgnore")     |

## displayName

集群的显示名称

`displayName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-displayname.md "undefined#/properties/displayName")

### displayName Type

`string`

## scheduler

集群所使用的调度器，目前只支持slurm

`scheduler`

*   is required

*   Type: merged type ([Details](definition-properties-scheduler.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-scheduler.md "undefined#/properties/scheduler")

### scheduler Type

merged type ([Details](definition-properties-scheduler.md))

any of

*   [Untitled string in undefined](definition-properties-scheduler-anyof-0.md "check type definition")

### scheduler Default Value

The default value is:

```json
"slurm"
```

## slurm



`slurm`

*   is required

*   Type: `object` ([Details](definition-properties-slurm.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm.md "undefined#/properties/slurm")

### slurm Type

`object` ([Details](definition-properties-slurm.md))

## misIgnore

在实际进行MIS操作时忽略这个集群

`misIgnore`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-misignore.md "undefined#/properties/misIgnore")

### misIgnore Type

`boolean`
