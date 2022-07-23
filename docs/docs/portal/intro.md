---
sidebar_position: 1
title: 简介
---

# 门户系统

门户系统给高性能计算集群的用户提供了一个基本web的功能入口。

# 支持的功能

- 连接到登录节点的终端
- 作业管理、提交
- 文件管理
- 使用桌面节点的桌面
- 以GUI和Web形式启动计算作业，并在浏览器上使用软件

# 前提条件

请确认集群配置满足以下条件：

- [集群配置文件](../common/deployment/clusters.mdx)中的所有集群已指定至少一个登录节点和一个计算节点
- **服务节点**可以免密以任何用户SSH登录到各个**登录节点**，并且**服务节点**的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- **服务节点**以及**门户**容器可以使用集群配置文件中的地址可以访问到所有计算节点的所有端口

# 部署

1. [前端](./deployment/web.mdx)
2. [作业管理](./deployment/jobs.md)
3. [终端](./deployment/shell.md)
4. [文件服务](./deployment/file.md)
5. [交互式应用](./deployment/apps.md)
