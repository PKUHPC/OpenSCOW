## slurm Type

`object` ([Details](definition-properties-slurm.md))

# slurm Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                                      |
| :---------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [loginNodes](#loginnodes)     | `array`  | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-loginnodes.md "undefined#/properties/slurm/properties/loginNodes")     |
| [computeNodes](#computenodes) | `array`  | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-computenodes.md "undefined#/properties/slurm/properties/computeNodes") |
| [partitions](#partitions)     | `object` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions.md "undefined#/properties/slurm/properties/partitions")     |
| [mis](#mis)                   | `object` | Optional | cannot be null | [Untitled schema](definition-properties-slurm-properties-mis.md "undefined#/properties/slurm/properties/mis")                   |

## loginNodes

集群的登录节点地址

`loginNodes`

*   is required

*   Type: `string[]`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-loginnodes.md "undefined#/properties/slurm/properties/loginNodes")

### loginNodes Type

`string[]`

### loginNodes Default Value

The default value is:

```json
[]
```

## computeNodes

集群的计算节点地址

`computeNodes`

*   is required

*   Type: `string[]`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-computenodes.md "undefined#/properties/slurm/properties/computeNodes")

### computeNodes Type

`string[]`

### computeNodes Default Value

The default value is:

```json
[]
```

## partitions



`partitions`

*   is required

*   Type: `object` ([Details](definition-properties-slurm-properties-partitions.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions.md "undefined#/properties/slurm/properties/partitions")

### partitions Type

`object` ([Details](definition-properties-slurm-properties-partitions.md))

## mis

slurm的MIS配置

`mis`

*   is optional

*   Type: `object` ([Details](definition-properties-slurm-properties-mis.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-mis.md "undefined#/properties/slurm/properties/mis")

### mis Type

`object` ([Details](definition-properties-slurm-properties-mis.md))
