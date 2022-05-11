---
sidebar_position: 3
title: 文件管理
---

# 部署文件管理功能

文件管理功能能够让用户在浏览器上就能管理集群中的文件。

和其他组件不同，文件管理服务器（`file-server`）不能以容器形式部署在服务节点上，而应该单独部署到每个需要文件管理的集群上。

文件管理服务器是一个可以直接运行的可执行文件（下称**服务**）。这个程序应该运行在每个集群的某个满足以下条件的节点上：

- 运行Linux
- 节点能访问集群存储
- 节点上有所有集群用户
- 机器能访问系统的**认证系统(auth)**
- 系统的**网关(gateway)**可以访问节点
- 运行服务的用户能够以任意用户运行进程（典型的以root用户运行）
- 服务的二进制文件可以被任意用户运行（意味着服务文件及所在所有父目录的所有用户有x权限）

一般来说，每个集群的**登录节点**满足这些条件。如果您的集群的登录节点不满足这些条件，请根据自己的情况选择。

## 在文件管理节点上部署文件服务

1. 在节点上创建一个空目录，
2. 在目录中，创建`.env`文件，并输入以下配置

```env
# 认证系统地址，一定要加协议(http://)
AUTH_URL=http://service:7575
# 用户的home目录模板，用{userId}替代用户名
USER_HOME=/nfs/{userId}
```

3. 下载[helper.sh](%REPO_FILE_URL%/apps/file-server/helper.sh)并放到目录里，并给此脚本设置可执行权限
4. 运行`./bin.sh pull`下载服务
    - 如果您从其他方式获得了文件管理服务的二进制文件（如从源码构建），那么不需要运行`pull`下载服务
    - 请将下载好的二进制文件放到此目录中，并改名为`file-server`并给可执行权限，然后进行下一步
5. 运行`./bin.sh up -d`在后台运行服务

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      # ...
      # 启动文件管理功能的集群名，如果有多个，以,分割
      FILE_SERVERS: hpc01
```

给网关项目增加配置：

```yml title=docker-compose.yml
  gateway:
    image: %CR_URL%/gateway
    environment:
      # ...
      # 格式：集群名=文件管理服务的地址
      FILE_SERVERS: hpc01=http://192.168.88.240:5000
```

运行`docker compose up -d`更新系统。