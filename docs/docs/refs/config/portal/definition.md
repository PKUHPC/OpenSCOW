## Untitled object in undefined Type

`object` ([Details](definition.md))

# Untitled object in undefined Properties

| Property                                    | Type      | Required | Nullable       | Defined by                                                                                                  |
| :------------------------------------------ | :-------- | :------- | :------------- | :---------------------------------------------------------------------------------------------------------- |
| [jobManagement](#jobmanagement)             | `boolean` | Required | cannot be null | [Untitled schema](definition-properties-jobmanagement.md "undefined#/properties/jobManagement")             |
| [loginDesktop](#logindesktop)               | `object`  | Required | cannot be null | [Untitled schema](definition-properties-logindesktop.md "undefined#/properties/loginDesktop")               |
| [apps](#apps)                               | `boolean` | Required | cannot be null | [Untitled schema](definition-properties-apps.md "undefined#/properties/apps")                               |
| [homeText](#hometext)                       | `object`  | Required | cannot be null | [Untitled schema](definition-properties-hometext.md "undefined#/properties/homeText")                       |
| [homeTitle](#hometitle)                     | `object`  | Required | cannot be null | [Untitled schema](definition-properties-hometitle.md "undefined#/properties/homeTitle")                     |
| [misUrl](#misurl)                           | `string`  | Optional | cannot be null | [Untitled schema](definition-properties-misurl.md "undefined#/properties/misUrl")                           |
| [shell](#shell)                             | `boolean` | Required | cannot be null | [Untitled schema](definition-properties-shell.md "undefined#/properties/shell")                             |
| [submitJobDefaultPwd](#submitjobdefaultpwd) | `string`  | Required | cannot be null | [Untitled schema](definition-properties-submitjobdefaultpwd.md "undefined#/properties/submitJobDefaultPwd") |
| [savedJobsDir](#savedjobsdir)               | `string`  | Required | cannot be null | [Untitled schema](definition-properties-savedjobsdir.md "undefined#/properties/savedJobsDir")               |
| [appJobsDir](#appjobsdir)                   | `string`  | Required | cannot be null | [Untitled schema](definition-properties-appjobsdir.md "undefined#/properties/appJobsDir")                   |
| [turboVNCPath](#turbovncpath)               | `string`  | Required | cannot be null | [Untitled schema](definition-properties-turbovncpath.md "undefined#/properties/turboVNCPath")               |

## jobManagement

是否启动作业管理功能

`jobManagement`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-jobmanagement.md "undefined#/properties/jobManagement")

### jobManagement Type

`boolean`

### jobManagement Default Value

The default value is:

```json
true
```

## loginDesktop



`loginDesktop`

*   is required

*   Type: `object` ([Details](definition-properties-logindesktop.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-logindesktop.md "undefined#/properties/loginDesktop")

### loginDesktop Type

`object` ([Details](definition-properties-logindesktop.md))

## apps

是否启用交互式任务功能

`apps`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-apps.md "undefined#/properties/apps")

### apps Type

`boolean`

### apps Default Value

The default value is:

```json
true
```

## homeText



`homeText`

*   is required

*   Type: `object` ([Details](definition-properties-hometext.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometext.md "undefined#/properties/homeText")

### homeText Type

`object` ([Details](definition-properties-hometext.md))

## homeTitle



`homeTitle`

*   is required

*   Type: `object` ([Details](definition-properties-hometitle.md))

*   cannot be null

*   defined in: [Untitled schema](definition-properties-hometitle.md "undefined#/properties/homeTitle")

### homeTitle Type

`object` ([Details](definition-properties-hometitle.md))

## misUrl

管理系统的部署URL或者路径

`misUrl`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-misurl.md "undefined#/properties/misUrl")

### misUrl Type

`string`

## shell

是否启用终端功能

`shell`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-shell.md "undefined#/properties/shell")

### shell Type

`boolean`

### shell Default Value

The default value is:

```json
true
```

## submitJobDefaultPwd

提交作业的默认工作目录。使用{name}代替作业名称。相对于用户的家目录

`submitJobDefaultPwd`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-submitjobdefaultpwd.md "undefined#/properties/submitJobDefaultPwd")

### submitJobDefaultPwd Type

`string`

### submitJobDefaultPwd Default Value

The default value is:

```json
"scow/jobs/{name}"
```

## savedJobsDir

将保存的作业保存到什么位置。相对于用户家目录

`savedJobsDir`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-savedjobsdir.md "undefined#/properties/savedJobsDir")

### savedJobsDir Type

`string`

### savedJobsDir Default Value

The default value is:

```json
"scow/savedJobs"
```

## appJobsDir

将交互式任务的信息保存到什么位置。相对于用户的家目录

`appJobsDir`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-appjobsdir.md "undefined#/properties/appJobsDir")

### appJobsDir Type

`string`

### appJobsDir Default Value

The default value is:

```json
"scow/appData"
```

## turboVNCPath

TurboVNC的安装路径

`turboVNCPath`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Untitled schema](definition-properties-turbovncpath.md "undefined#/properties/turboVNCPath")

### turboVNCPath Type

`string`

### turboVNCPath Default Value

The default value is:

```json
"/opt/TurboVNC"
```
