---
sidebar_position: 2
title: 配置Web类应用
---

# 配置Web类应用

## 前提条件

请确保在需要运行应用的计算节点上安装有需要的软件包。

## 配置示例

下面以使用[coder/code-server](https://github.com/coder/code-server)启动VSCode的配置为例来讲解如何配置一个服务器类应用。

创建`config/apps`目录，在里面创建`vscode.yml`文件，其内容如下：

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
    select:
      - value: version10
        label: v10
      - value: version11
        label: v11
```

增加了此文件后，运行以下命令重启job-server即可。

```bash
./compose.sh restart portal-web
```

## 配置解释

### `proxyType`

对于web类型的应用，需要配置`proxyType`。不同的交互式应用使用了不同的nginx proxy方式，通过配置`proxyType`，可以允许应用携带不同类型的uri到后端计算节点。

`proxyType`可以配置为`relative`或者`absolute`，如果不配置默认是`relative`。

- 如果设置成`absolute`，会把完整URL请求路径反向代理到给定的主机和端口。比如访问以下地址：
  
  > https://hpc.pku.edu/proxy/192.168.220.133/7383/index.html

  以下URL请求将会被发送给计算节点`192.168.220.133`的`7383`端口。

  > /proxy/192.168.220.133/7383/index.html
  
- 如果设置成`relative`，只使用URL请求路径的路径部分将请求反向代理到给定的主机和端口。比如访问以下地址：

  > https://hpc.pku.edu/rproxy/192.168.220.133/4253/index.html

  以下URL请求将会被发送给计算节点`192.168.220.133`的`4253`端口。

  > /index.html


### `beforeScript`和`script`

`beforeScript`部分为准备脚本。这个脚本用来准备运行任务的环境。这个脚本要求必须export两个变量：

- `PORT`：程序将会运行在的端口
- `PASSWORD`: 连接程序用的密码

`connect`的`formData`项需要使用的变量也需要在此处export。

准备脚本中的`export`的变量可以在`script`中使用。

`script`部分为如何启动这个应用的脚本。

`beforeScript`和`script`中可以使用以下辅助函数：

| 函数名         | 作用                            | 参数           | 返回值                  |
| -------------- | ------------------------------- | -------------- | ----------------------- |
| `get_port`     | 获得一个可用的TCP端口           | 无             | 一个调用时可用的TCP端口 |
| `get_password` | 生成一个包含A-Za-z0-9的随机密码 | `$1`: 密码长度 | 密码                    |

这些脚本，以及一些辅助的脚本将会被作为一个作业提交给调度系统，并最终在某个计算节点上运行。

### `connect`

`connect`部分定义如何连接到应用。系统将会给可以连接的应用创建一个用于连接应用的a标签。点击a标签之后，系统将会打开一个新标签页，打开新标签页时实际进行的动作将可以在这里自定义。

配置如下：

| 属性       | 类型                 | 是否必填 | 解释                                          |
| ---------- | -------------------- | -------- | --------------------------------------------- |
| `path`     | 字符串               | 是       | 新标签页所访问的相对路径                      |
| `method`   | "GET" 或者 "POST"    | 是       | 发起一个什么的HTTP请求                        |
| `query`    | 字符串到字符串的字典 | 否       | 连接时附带的query                             |
| `formData` | 字符串到字符串的字典 | 否       | 如果`method`是POST，这个请求将会带的form data |


我们推荐将应用使用密码方式进行加密，所以一般在连接时需要将密码输入给应用。`path`, `query`的值和`formData`的值部分可以使用`{{ PASSWORD }}`代替应用在创建时生成的密码。

此外，如果`formData`需要使用其他变量，可以在准备脚本`beforeScript`中export需要的变量，然后以`{{ 变量名 }}`的形式使用。

### `attributes`

通过`attributes`配置项，可以修改创建应用的HTML表单，允许管理员定义用户创建交互式应用时的表单选项，让用户能够指定应用的版本等。

用户提交的内容会作为运行应用的计算节点的环境变量生效。

配置`attributes`可以加载多个HTML表单，每一条可用配置项如下：

| 属性       | 类型                           | 是否必填 | 解释                             |
|----------|------------------------------|------|--------------------------------|
| `type`   | `number`, `text` 或者 `select` | 是    | 在HTML表单元素中输入的内容的类型             |
| `name`   | 字符串                          | 是    | HTML表单的name属性，在编程中使用，并且会作为计算节点环境变量名     |
| `label`  | 字符串                          | 是    | HTML表单的label属性，输入框左侧显示的标签      |
| `select` | 选项的列表                        | 否    | 如果`type`是`select`，必须配置此项，指明具体的选项，具体配置办法见`select`示例 |

#### 配置输入类型为文本的HTML表单

配置一个输入内容是文本类型的表单，需要指定`type`为`text`, 示例如下：

```yaml
attributes:
  - type: text
    name: version
    label: 版本
```

如果用户输入了`v3.4.5`，计算节点的环境变量`version=v3.4.5`可以在应用启动时被读取。

#### 配置输入类型为数字的HTML表单

配置一个输入内容是数字类型的表单，需要指定`type`为`number`, 此时用户仅能输入数字，示例如下：

```yaml
attributes:
  - type: number
    name: size
    label: 数量
```

如果用户输入了345，计算节点的环境变量`size=345`可以在应用启动时被读取。

#### 配置输入为下拉选择器的HTML表单

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
