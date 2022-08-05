## periodicFetch Type

`object` ([Details](definition-properties-fetchjobs-properties-periodicfetch.md))

## periodicFetch Default Value

The default value is:

```json
{}
```

# periodicFetch Properties

| Property            | Type      | Required | Nullable       | Defined by                                                                                                                                                                      |
| :------------------ | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [enabled](#enabled) | `boolean` | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch-properties-enabled.md "undefined#/properties/fetchJobs/properties/periodicFetch/properties/enabled") |
| [cron](#cron)       | `string`  | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch-properties-cron.md "undefined#/properties/fetchJobs/properties/periodicFetch/properties/cron")       |

## enabled

是否默认打开

`enabled`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch-properties-enabled.md "undefined#/properties/fetchJobs/properties/periodicFetch/properties/enabled")

### enabled Type

`boolean`

### enabled Default Value

The default value is:

```json
true
```

## cron

获取信息的周期的cron表达式

`cron`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch-properties-cron.md "undefined#/properties/fetchJobs/properties/periodicFetch/properties/cron")

### cron Type

`string`

### cron Default Value

The default value is:

```json
"* * 1 * * *"
```
