## homeTitle Type

`object` ([Details](definition-properties-hometitle.md))

# homeTitle Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                            |
| :-------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| [defaultText](#defaulttext) | `string` | Required | cannot be null | [Untitled schema](definition-properties-hometitle-properties-defaulttext.md "undefined#/properties/homeTitle/properties/defaultText") |
| [hostnameMap](#hostnamemap) | `object` | Required | cannot be null | [Untitled schema](definition-properties-hometitle-properties-hostnamemap.md "undefined#/properties/homeTitle/properties/hostnameMap") |

## defaultText

默认主页标题

`defaultText`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometitle-properties-defaulttext.md "undefined#/properties/homeTitle/properties/defaultText")

### defaultText Type

`string`

### defaultText Default Value

The default value is:

```json
"SCOW"
```

## hostnameMap

根据域名(hostname，不包括port)不同，显示在主页上的标题

`hostnameMap`

*   is required

*   Type: `object` ([Details](definition-properties-hometitle-properties-hostnamemap.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometitle-properties-hostnamemap.md "undefined#/properties/homeTitle/properties/hostnameMap")

### hostnameMap Type

`object` ([Details](definition-properties-hometitle-properties-hostnamemap.md))

### hostnameMap Default Value

The default value is:

```json
{}
```
