## fetchJobs Type

`object` ([Details](definition-properties-fetchjobs.md))

# fetchJobs Properties

| Property                        | Type      | Required | Nullable       | Defined by                                                                                                                                |
| :------------------------------ | :-------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| [db](#db)                       | `object`  | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-db.md "undefined#/properties/fetchJobs/properties/db")                       |
| [startIndex](#startindex)       | `integer` | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-startindex.md "undefined#/properties/fetchJobs/properties/startIndex")       |
| [batchSize](#batchsize)         | `integer` | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-batchsize.md "undefined#/properties/fetchJobs/properties/batchSize")         |
| [periodicFetch](#periodicfetch) | `object`  | Required | cannot be null | [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch.md "undefined#/properties/fetchJobs/properties/periodicFetch") |

## db



`db`

*   is required

*   Type: `object` ([Details](definition-properties-fetchjobs-properties-db.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-db.md "undefined#/properties/fetchJobs/properties/db")

### db Type

`object` ([Details](definition-properties-fetchjobs-properties-db.md))

## startIndex

从哪个biJobIndex开始获取数据

`startIndex`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-startindex.md "undefined#/properties/fetchJobs/properties/startIndex")

### startIndex Type

`integer`

## batchSize

为了防止一次性获取太多数据占用过多内存，每次获取的任务信息数量。如果一次需要获取的信息超过这个数字，那么将会连续多次获取

`batchSize`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-batchsize.md "undefined#/properties/fetchJobs/properties/batchSize")

### batchSize Type

`integer`

### batchSize Default Value

The default value is:

```json
100000
```

## periodicFetch



`periodicFetch`

*   is required

*   Type: `object` ([Details](definition-properties-fetchjobs-properties-periodicfetch.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-fetchjobs-properties-periodicfetch.md "undefined#/properties/fetchJobs/properties/periodicFetch")

### periodicFetch Type

`object` ([Details](definition-properties-fetchjobs-properties-periodicfetch.md))

### periodicFetch Default Value

The default value is:

```json
{}
```
