## ^.\*$ Type

`object` ([Details](definition-properties-slurm-properties-partitions-patternproperties-.md))

# ^.\*$ Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                  |
| :------------------ | :-------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [mem](#mem)         | `integer` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-mem.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/mem")         |
| [cores](#cores)     | `integer` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-cores.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/cores")     |
| [gpus](#gpus)       | `integer` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-gpus.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/gpus")       |
| [nodes](#nodes)     | `integer` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-nodes.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/nodes")     |
| [qos](#qos)         | `array`   | Optional | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-qos.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/qos")         |
| [comment](#comment) | `string`  | Optional | cannot be null | [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-comment.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/comment") |

## mem

内存，单位M

`mem`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-mem.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/mem")

### mem Type

`integer`

## cores

核心数

`cores`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-cores.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/cores")

### cores Type

`integer`

## gpus

GPU卡数

`gpus`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-gpus.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/gpus")

### gpus Type

`integer`

## nodes

节点数

`nodes`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-nodes.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/nodes")

### nodes Type

`integer`

## qos



`qos`

*   is optional

*   Type: `string[]`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-qos.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/qos")

### qos Type

`string[]`

## comment

计费项说明

`comment`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-partitions-patternproperties--properties-comment.md "undefined#/properties/slurm/properties/partitions/patternProperties/^.*$/properties/comment")

### comment Type

`string`
