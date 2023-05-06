---
sidebar_position: 4
title: 配置HTML表单
---

# 配置HTML表单

Web和VNC类应用都可以通过`attributes`配置项，修改创建应用的HTML表单，允许管理员定义用户创建交互式应用时的表单选项，让用户能够指定应用的版本等信息。

用户提交的内容会作为运行应用的计算节点的环境变量生效，web类应用可以在`script`项使用，VNC类应用可以在`xstartup`使用这些变量。

如果用户需要输入其他sbatch参数，可以在此项中配置，具体示例请参考[其他sbatch参数配置](#配置其他sbatch参数)。。

## 配置示例

### web类应用配置HTML表单示例

以[coder/code-server](https://github.com/coder/code-server)启动VSCode为例，为web类应用自定义HTML表单的配置文件如下：

```yaml title="config/apps/vscode.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

# 指定应用类型为web
type: web

# Web应用的配置
web:

  # 指定反向代理类型
  proxyType: relative

  # 准备脚本
  beforeScript: |
    export PORT=$(get_port)
    export PASSWORD=$(get_password 12)

  # 运行任务的脚本。使用了用户在自定义表单中选择的选项
  script: |
    module load ${selectVersion}
    PASSWORD=$PASSWORD code-server -vvv --bind-addr 0.0.0.0:$PORT --auth password

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"

# 配置HTML表单，用户可以指定code-server版本      
attributes:
  - type: select
    name: selectVersion
    label: 选择版本
    required: true  # 用户必须选择一个版本
    placeholder: 选择code-server的版本  # 提示信息
    select:
      - value: code-server/4.8.0
        label: version 4.8.0
      - value: code-server/4.9.0
        label: version 4.9.0
```

如果用户选择的是`version 4.8.0`选项，`xstartup`中`module load ${selectVersion}`实际执行的是`module load code-server/4.8.0`。

### VNC类应用配置HTML表单示例

以Emacs为例，桌面类应用自定义HTML表单的配置文件如下：

```yaml title="config/apps/emacs.yml"
# 这个应用的ID
id: emacs

# 这个应用的名字
name: emacs

# 指定应用类型为vnc
type: vnc

# VNC应用的配置
vnc: 

  # 可以使用准备脚本来准备运行任务的环境
  # beforeScript:
  #   export VERSION=1.0
  
  # 此X Session的xstartup脚本。使用了用户在自定义表单中选择的选项
  xstartup: |
    module load ${selectVersion}
    emacs -mm

# 配置HTML表单，用户可以指定Emacs版本      
attributes:
  - type: select
    name: selectVersion
    label: 选择版本
    required: true  # 用户必须选择一个版本
    placeholder: 选择code-server的版本  # 提示信息
    select:
      - value: emacs/27.1
        label: Emacs 27.1 released
      - value: emacs/28.1
        label: Emacs 28.1 released

```

如果用户选择的是`Emacs 28.1 released`选项，`xstartup`中`module load ${selectVersion}`实际执行的是`module load emacs/28.1`。

## 配置解释

配置`attributes`可以加载多个HTML表单，每一条可用配置项如下：

| 属性         | 类型                           | 是否必填 | 解释                                                                        |
|------------|------------------------------|------|---------------------------------------------------------------------------|
| `type`     | `number`, `text` 或者 `select` | 是    | 在HTML表单元素中输入的内容的类型                                                        |
| `name`     | 字符串                          | 是    | HTML表单的name属性，在编程中使用，并且会作为计算节点环境变量名，可以在Web应用的`script`或者VNC应用的`xstartop`使用 |
| `label`    | 字符串                          | 是    | HTML表单的label属性，输入框左侧显示的标签                                                 |
| `required` | 布尔类型                         | 否    | 如果设置为`true`，用户必须填写此项，如果为`false`，用户可以不填，默认为`true`。                        |
| `default` | 字符串或者数字                         | 否    | 表单的默认值，`number`类型的默认值必须设置为数字。对于`select`类型的表单，如果没有配置`default`，则默认值为第一项                      |
| `placeholder`   | 字符串                        | 否    | 描述输入字段预期值的提示信息，提示用户此处的输入                                                  |
| `select`   | 选项的列表                        | 否    | 如果`type`是`select`，必须配置此项，指明具体的选项，具体配置办法见`select`示例                        |

### 配置输入类型为文本的HTML表单

配置一个输入内容是文本类型的表单，需要指定`type`为`text`, 示例如下：

```yaml
attributes:
  - type: text
    name: version
    label: 版本
```

如果用户输入了`v3.4.5`，计算节点的环境变量`version=v3.4.5`可以在应用启动时被读取。

配置一个不是必填项的表单，并且配置默认值：

```yaml
attributes:
  - type: text
    name: version
    label: 版本
    required: false
    defalt: v3.4.0
```

### 配置输入类型为数字的HTML表单

配置一个输入内容是数字类型的表单，需要指定`type`为`number`, 此时用户仅能输入数字，示例如下：

```yaml
attributes:
  - type: number
    name: size
    label: 数量
```

如果用户输入了345，计算节点的环境变量`size=345`可以在应用启动时被读取。

配置一个不是必填项的表单，并且配置默认值：
```yaml
attributes:
  - type: number
    name: size
    label: 数量
    required: false
    default: 123
```

### 配置输入为下拉选择器的HTML表单

配置一个输入内容是下拉选择器的表单，需要指定`type`为`select`,并且配置`select`项。`select`项需要配置`value`和`label`，作为用户可以选择的选项。

| 属性       | 类型                           | 是否必填 | 解释                             |
|----------|------------------------------|------|--------------------------------|
| `value`   | 字符串 | 是    | HTML表单选项的value属性，在编程中使用，并且会作为计算节点环境变量的值             |
| `label`   | 字符串                          | 是    | HTML表单的label属性，选项中展示给用户的文本     |

示例如下：

```yaml
attributes:
  - type: select
    name: selectVersion
    label: 选择版本
    required: true
    select:
      - value: version10
        label: v10
      - value: version11
        label: v11
```

如果用户选择v11选项，计算节点的环境变量 `selectVersion=version11` 可以在应用启动时被读取。

### 配置其他sbatch参数

`name`需要设置为`sbatchOptions`，指定`type`为`text`, 示例如下：

```yaml
attributes:
  - type: text
    name: sbatchOptions
    label: 其他sbatch参数
    required: false
    placeholder: "比如：--gpus gres:2 --time 10"
```