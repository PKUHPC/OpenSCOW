## connect Type

`object` ([Details](definition-properties-web-properties-connect.md))

# connect Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                |
| :-------------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [method](#method)     | Merged   | Required | cannot be null | [Untitled schema](definition-properties-web-properties-connect-properties-method.md "undefined#/properties/web/properties/connect/properties/method")     |
| [path](#path)         | `string` | Required | cannot be null | [Untitled schema](definition-properties-web-properties-connect-properties-path.md "undefined#/properties/web/properties/connect/properties/path")         |
| [query](#query)       | `object` | Optional | cannot be null | [Untitled schema](definition-properties-web-properties-connect-properties-query.md "undefined#/properties/web/properties/connect/properties/query")       |
| [formData](#formdata) | `object` | Optional | cannot be null | [Untitled schema](definition-properties-web-properties-connect-properties-formdata.md "undefined#/properties/web/properties/connect/properties/formData") |

## method

连接所使用的HTTP方法

`method`

*   is required

*   Type: merged type ([Details](definition-properties-web-properties-connect-properties-method.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-connect-properties-method.md "undefined#/properties/web/properties/connect/properties/method")

### method Type

merged type ([Details](definition-properties-web-properties-connect-properties-method.md))

any of

*   [Untitled string in undefined](definition-properties-web-properties-connect-properties-method-anyof-0.md "check type definition")

*   [Untitled string in undefined](definition-properties-web-properties-connect-properties-method-anyof-1.md "check type definition")

## path

启动的相对路径

`path`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-connect-properties-path.md "undefined#/properties/web/properties/connect/properties/path")

### path Type

`string`

## query

query参数

`query`

*   is optional

*   Type: `object` ([Details](definition-properties-web-properties-connect-properties-query.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-connect-properties-query.md "undefined#/properties/web/properties/connect/properties/query")

### query Type

`object` ([Details](definition-properties-web-properties-connect-properties-query.md))

## formData

设置为POST时，需要以form data形式提交的数据

`formData`

*   is optional

*   Type: `object` ([Details](definition-properties-web-properties-connect-properties-formdata.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-web-properties-connect-properties-formdata.md "undefined#/properties/web/properties/connect/properties/formData")

### formData Type

`object` ([Details](definition-properties-web-properties-connect-properties-formdata.md))
