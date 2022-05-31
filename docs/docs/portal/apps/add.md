---
sidebar_position: 2
title: 增加应用
---

# 增加交互式应用

交互式应用的相关配置和文件应该写在配置目录(`config`)的`apps`目录下。

下面以使用[coder/code-server](https://github.com/coder/code-server)启动VSCode的配置为例来讲解如何增加一个交互式应用。

创建`config/apps`目录，在里面创建`vscode.yml`文件，其内容如下：

```yaml title="config/apps/vscode.yml"
# 这个应用的ID
id: vscode
# 这个应用的名字
name: VSCode
# 能够启动这个应用的计算节点的地址
nodes:
  - t001
  - t002
# 启动应用的脚本
script: |
  PORT=`python -c 'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()'`
  echo "$(hostname):$PORT" >> SESSION_INFO

  code-server -vvv --bind-addr 0.0.0.0:$PORT --auth none
```

`script`部分为如何启动这个应用的脚本。这个脚本将会被作为一个作业提交给调度系统，并最终在某个计算节点上运行。所以，请保证在需要运行应用的机器（在示例中即为`t001`和`t002`节点）上安装有需要的软件包。

启动应用的脚本在运行时必须输出一个名为`SESSION_INFO`的文件，其内容为`运行脚本的机器的hostname:应用将会监听的端口`，表示这个应用的地址。前端将会使用这个地址连接到应用。

增加了此文件后，运行以下命令重启job-server和portal-web。

```bash
docker compose restart portal-web job-server
```

