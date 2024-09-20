---
sidebar_position: 2
title: 配置Web类应用
---

# 配置Web类应用

## 前提条件

请确保计算节点可以拉取或者已经存在配置中应用的镜像。

## 配置示例

下面以使用[coder/code-server](https://github.com/coder/code-server)启动VSCode的配置为例来讲解如何配置一个服务器类应用。

创建`config/ai/apps`目录，在里面创建`vscode/config.yml`或`vscode.yml`文件，其内容如下：

```yaml title="config/ai/apps/vscode/config.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

# 指定应用类型为web
type: web

image:
  # 镜像名称
  name: codercom/code-server
  # 镜像版本
  tag: 4.20.0

# Web应用的配置
web:

  # 指定反向代理类型
  proxyType: relative

  # 准备脚本
  beforeScript: |
    export PASSWORD=$(get_password 12)

 # 指明运行任务的脚本中的启动命令，用户在创建应用页面可以在脚本中替换该命令
  startCommand:
    code-server
  # 运行任务的脚本。可以使用准备脚本定义的变量
  script: |
    PASSWORD=$PASSWORD code-server -vvv --bind-addr 0.0.0.0:$PORT --auth password

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"

```

增加了此文件后，刷新即可。

## 配置解释

### `proxyType`

[参考门户系统](../../portal/apps/configure-web-app.md#proxytype)

### `image`

该镜像将会被用来启动应用。`name`和`tag`分别指定镜像的名称和版本。如果本地没有该镜像，将会尝试从镜像仓库拉取。

### `logoPath`
  
[参考门户系统](../../portal/apps/configure-app-logo.md)

### `appComment`

[参考门户系统](../../portal/apps/configure-app-comment.md)


### `beforeScript`，`startCommand` 和`script`


`beforeScript`部分为准备脚本。这个脚本用来准备运行任务的环境。这个脚本要求必须export一个变量：

- `PASSWORD`: 连接程序用的密码

`connect`的`formData`项需要使用的变量也需要在此处export。

准备脚本中的`export`的变量可以在`script`中使用。

`script`部分为如何启动这个应用的脚本。

`startCommand` 需要指明`scipt`中启动应用的命令，可供用户在使用自定义镜像时指定启动的命令，在默认情况下为`code-server`

`beforeScript`和`script`中可以使用以下辅助函数：

| 函数名         | 作用                            | 参数           | 返回值                  |
| -------------- | ------------------------------- | -------------- | ----------------------- |
| `get_password` | 生成一个包含A-Za-z0-9的随机密码 | `$1`: 密码长度 | 密码                    |

还可以使用以下变量。

| 变量名            | 值                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| `PROXY_BASE_PATH` | 这个应用在被访问时，其URL中位于**计算节点IP**之前的内容，不以`/`结尾。对OpenSCOW AI来说，为`${OpenSCOW AI的base path}/api/proxy/${集群ID}/${此应用的proxyType}`， 如果[自定义属性](../../portal/apps/configure-attributes.md)中出现了同名的变量，该值将会被覆盖。 |
| `PORT` | 这个应用启动时容器内的端口|
| `HOST` | 这个应用启动时容器映射的主机名|
| `SVCPORT` | 这个应用启动后，OpenSCOW AI 节点可通过`HOST`:`SVCPORT`访问该应用|


这些脚本会被提交给调度系统，并最终运行后在计算节点上启动应用。

### `attributes`
  
[参考门户系统](../../portal/apps/configure-attributes.md)