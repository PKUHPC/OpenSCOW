---
sidebar_position: 2
title: 样例：VSCode配置
---

# 样例：VSCode配置

## 前提条件

请确保在需要运行应用的计算节点上安装有需要的软件包。

下面讲解使用[coder/code-server](https://github.com/coder/code-server)启动VSCode的配置。

## 配置文件

创建`config/apps`目录，在里面创建`vscode.yml`文件，其内容如下：

```yaml title="config/apps/vscode.yml"
# 这个应用的ID
id: vscode

# 这个应用的名字
name: VSCode

# 指定应用类型为web
type: web

# 指定反向代理类型
proxyType: relative

# Web应用的配置
web:

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
```

增加了此文件后，运行以下命令重启portal-web和portal-server。

```bash
./compose.sh restart portal-web portal-server
```