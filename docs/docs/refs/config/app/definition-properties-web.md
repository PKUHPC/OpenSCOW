## web Type

`object` ([Details](definition-properties-web.md))

# web Properties

| Property                      | Type     | Required | Nullable       | Defined by                                                                                                                  |
| :---------------------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| [beforeScript](#beforescript) | `string` | Required | cannot be null | [Untitled schema](definition-properties-web-properties-beforescript.md "undefined#/properties/web/properties/beforeScript") |
| [script](#script)             | `string` | Required | cannot be null | [Untitled schema](definition-properties-web-properties-script.md "undefined#/properties/web/properties/script")             |
| [connect](#connect)           | `object` | Required | cannot be null | [Untitled schema](definition-properties-web-properties-connect.md "undefined#/properties/web/properties/connect")           |

## beforeScript

启动应用之前的准备命令。具体参考文档

`beforeScript`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-beforescript.md "undefined#/properties/web/properties/beforeScript")

### beforeScript Type

`string`

## script

启动应用的命令。可以使用beforeScript中定义的变量

`script`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-script.md "undefined#/properties/web/properties/script")

### script Type

`string`

## connect

如何连接应用

`connect`

*   is required

*   Type: `object` ([Details](definition-properties-web-properties-connect.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-connect.md "undefined#/properties/web/properties/connect")

### connect Type

`object` ([Details](definition-properties-web-properties-connect.md))
