## mis Type

`object` ([Details](definition-properties-slurm-properties-mis.md))

# mis Properties

| Property                                      | Type     | Required | Nullable       | Defined by                                                                                                                                                                    |
| :-------------------------------------------- | :------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [managerUrl](#managerurl)                     | `string` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-mis-properties-managerurl.md "undefined#/properties/slurm/properties/mis/properties/managerUrl")                     |
| [dbPassword](#dbpassword)                     | `string` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-mis-properties-dbpassword.md "undefined#/properties/slurm/properties/mis/properties/dbPassword")                     |
| [associationTableName](#associationtablename) | `string` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-mis-properties-associationtablename.md "undefined#/properties/slurm/properties/mis/properties/associationTableName") |
| [scriptPath](#scriptpath)                     | `string` | Required | cannot be null | [Untitled schema](definition-properties-slurm-properties-mis-properties-scriptpath.md "undefined#/properties/slurm/properties/mis/properties/scriptPath")                     |

## managerUrl

slurm manager节点的URL

`managerUrl`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-mis-properties-managerurl.md "undefined#/properties/slurm/properties/mis/properties/managerUrl")

### managerUrl Type

`string`

## dbPassword

slurmdbd的数据库密码

`dbPassword`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-mis-properties-dbpassword.md "undefined#/properties/slurm/properties/mis/properties/dbPassword")

### dbPassword Type

`string`

## associationTableName

user\_association表名

`associationTableName`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-mis-properties-associationtablename.md "undefined#/properties/slurm/properties/mis/properties/associationTableName")

### associationTableName Type

`string`

## scriptPath

slurm.sh绝对路径

`scriptPath`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-slurm-properties-mis-properties-scriptpath.md "undefined#/properties/slurm/properties/mis/properties/scriptPath")

### scriptPath Type

`string`
