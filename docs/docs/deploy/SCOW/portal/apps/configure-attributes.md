---
sidebar_position: 4
title: 配置HTML表单
---

# 配置HTML表单

web和vnc类应用都可以通过`attributes`配置项，修改创建应用的HTML表单，允许管理员定义用户创建交互式应用时的表单选项，让用户能够指定应用的版本等信息。

用户提交的内容会作为运行应用的计算节点的环境变量生效。

## 配置示例

以code-server为例，为web类应用自定义HTML表单的配置文件如下：

```yaml title="config/apps/vscode.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

# 指定应用类型为web
type: web


# slurm配置
slurm:
  options:
     - "-x node[1-2]"

# Web应用的配置
web:

  # 指定反向代理类型
  proxyType: relative

  # 准备脚本
  beforeScript: |
    export PORT=$(get_port)
    export PASSWORD=$(get_password 12)

  # 运行任务的脚本。可以使用准备脚本定义的
  script: |
    PASSWORD=$PASSWORD code-server${selectVersion} -vvv --bind-addr 0.0.0.0:$PORT --auth password

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
    select:
      - value: version10
        label: v10
      - value: version11
        label: v11
```

以Emacs为例，桌面类应用自定义HTML表单的配置文件如下：

```yaml title="config/apps/emacs.yml"
# 这个应用的ID
id: emacs

# 这个应用的名字
name: emacs

# 指定应用类型为vnc
type: vnc

# slurm配置
slurm:
  options:
     - "-x node[1-2]"

# VNC应用的配置
vnc: 

  # 可以使用准备脚本来准备运行任务的环境
  # beforeScript:
  #   export VERSION=1.0
  
  # 此X Session的xstartup脚本
  xstartup: |
    emacs${selectVersion} -mm

# 配置HTML表单，用户可以指定Emacs版本      
attributes:
  - type: select
    name: selectVersion
    label: 选择版本
    select:
      - value: version27.1
        label: Emacs 27.1 released
      - value: version28.1
        label: Emacs 28.1 released

```

## 配置解释

配置`attributes`可以加载多个HTML表单，每一条可用配置项如下：

| 属性       | 类型                           | 是否必填 | 解释                             |
|----------|------------------------------|------|--------------------------------|
| `type`   | `number`, `text` 或者 `select` | 是    | 在HTML表单元素中输入的内容的类型             |
| `name`   | 字符串                          | 是    | HTML表单的name属性，在编程中使用，并且会作为计算节点环境变量名     |
| `label`  | 字符串                          | 是    | HTML表单的label属性，输入框左侧显示的标签      |
| `select` | 选项的列表                        | 否    | 如果`type`是`select`，必须配置此项，指明具体的选项，具体配置办法见`select`示例 |

### 配置输入类型为文本的HTML表单

配置一个输入内容是文本类型的表单，需要指定`type`为`text`, 示例如下：

```yaml
attributes:
  - type: text
    name: version
    label: 版本
```

如果用户输入了`v3.4.5`，计算节点的环境变量`version=v3.4.5`可以在应用启动时被读取。

### 配置输入类型为数字的HTML表单

配置一个输入内容是数字类型的表单，需要指定`type`为`number`, 此时用户仅能输入数字，示例如下：

```yaml
attributes:
  - type: number
    name: size
    label: 数量
```

如果用户输入了345，计算节点的环境变量`size=345`可以在应用启动时被读取。

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
    select:
      - value: version10
        label: v10
      - value: version11
        label: v11
```

如果用户选择v11选项，计算节点的环境变量 `selectVersion=version11` 可以在应用启动时被读取。

可以配置多个HTML表单：

```yaml
attributes:
  - type: text
    name: version
    label: 版本
  - type: number
    name: size
    label: 数量
  - type: select
    name: selectVersion
    label: 选择版本
    select:
      - value: version10
        label: v10
      - value: version11
        label: v11
```
