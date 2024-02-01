---
sidebar_position: 1
---

# VSCode

## 软件简介

code-server是一个基于VS Code的开源工具，它可以让你通过浏览器远程访问一个运行着VS Code的服务器。

## 前提条件

请确保在需要运行应用的计算节点有coder/code-server镜像或者可以拉取到配置里对应的镜像地址。



下面讲解如何配置使用code-server。
## 配置文件

创建`config/ai/apps`目录，在里面创建`vscode.yml`文件，其内容如下：

```yaml title="config/ai/apps/vscode.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

image:
  # 镜像名称
  name: codercom/code-server
  # 镜像版本
  tag: 4.20.0

# 指定应用类型为web
type: web

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
  # 运行任务的脚本。可以使用准备脚本定义的
  script: |
    PASSWORD=$PASSWORD
    code-server -vvv --bind-addr 0.0.0.0:$PORT --auth password

  # 如何连接应用
  connect:
    method: POST
    path: /login
    formData:
      password: "{{ PASSWORD }}"
```

## 注意事项

[参考门户系统的vscode配置示例的注意事项](../../../../portal/apps/apps/vscode/index.md#注意事项)