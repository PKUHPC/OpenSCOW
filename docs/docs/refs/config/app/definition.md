## Untitled object in undefined Type

`object` ([Details](definition.md))

# Untitled object in undefined Properties

| Property        | Type     | Required | Nullable       | Defined by                                                                      |
| :-------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------ |
| [name](#name)   | `string` | Required | cannot be null | [Untitled schema](definition-properties-name.md "undefined#/properties/name")   |
| [nodes](#nodes) | `array`  | Optional | cannot be null | [Untitled schema](definition-properties-nodes.md "undefined#/properties/nodes") |
| [type](#type)   | Merged   | Required | cannot be null | [Untitled schema](definition-properties-type.md "undefined#/properties/type")   |
| [web](#web)     | `object` | Optional | cannot be null | [Untitled schema](definition-properties-web.md "undefined#/properties/web")     |
| [vnc](#vnc)     | `object` | Optional | cannot be null | [Untitled schema](definition-properties-vnc.md "undefined#/properties/vnc")     |

## name

App名

`name`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-name.md "undefined#/properties/name")

### name Type

`string`

## nodes

支持启动这个App的节点名。如果不设置，则所有节点都可以运行

`nodes`

*   is optional

*   Type: `string[]`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-nodes.md "undefined#/properties/nodes")

### nodes Type

`string[]`

## type

应用类型

`type`

*   is required

*   Type: merged type ([Details](definition-properties-type.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-type.md "undefined#/properties/type")

### type Type

merged type ([Details](definition-properties-type.md))

any of

*   [Untitled string in undefined](definition-properties-type-anyof-0.md "check type definition")

*   [Untitled string in undefined](definition-properties-type-anyof-1.md "check type definition")

## web



`web`

*   is optional

*   Type: `object` ([Details](definition-properties-web.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web.md "undefined#/properties/web")

### web Type

`object` ([Details](definition-properties-web.md))

## vnc



`vnc`

*   is optional

*   Type: `object` ([Details](definition-properties-vnc.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-vnc.md "undefined#/properties/vnc")

### vnc Type

`object` ([Details](definition-properties-vnc.md))
