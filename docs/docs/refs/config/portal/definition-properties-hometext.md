## homeText Type

`object` ([Details](definition-properties-hometext.md))

# homeText Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                          |
| :-------------------------- | :------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| [defaultText](#defaulttext) | `string` | Required | cannot be null | [Untitled schema](definition-properties-hometext-properties-defaulttext.md "undefined#/properties/homeText/properties/defaultText") |
| [hostnameMap](#hostnamemap) | `object` | Required | cannot be null | [Untitled schema](definition-properties-hometext-properties-hostnamemap.md "undefined#/properties/homeText/properties/hostnameMap") |

## defaultText

默认主页文本

`defaultText`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometext-properties-defaulttext.md "undefined#/properties/homeText/properties/defaultText")

### defaultText Type

`string`

### defaultText Default Value

The default value is:

```json
"Super Computing on Web"
```

## hostnameMap

根据域名(hostname，不包括port)不同，显示在主页上的文本

`hostnameMap`

*   is required

*   Type: `object` ([Details](definition-properties-hometext-properties-hostnamemap.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometext-properties-hostnamemap.md "undefined#/properties/homeText/properties/hostnameMap")

### hostnameMap Type

`object` ([Details](definition-properties-hometext-properties-hostnamemap.md))

### hostnameMap Default Value

The default value is:

```json
{}
```
