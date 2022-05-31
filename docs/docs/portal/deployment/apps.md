---
sidebar_position: 5
title: 交互式应用
---

# 部署交互式应用

交互式应用功能能够让用户在浏览器上使用集群资源启动应用，并通过浏览器使用这些应用。

## 前提条件

请确认集群配置满足以下条件：

- [集群配置文件](../../common/deployment/clusters.mdx)中需要使用此功能的集群已指定至少一个登录节点和一个计算节点
- **服务节点**可以免密以任何用户SSH登录到各个**登录节点**，并且**服务节点**的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- **服务节点**以及**门户前端**容器可以使用集群配置文件中的地址访问到会启动应用的任何一个节点和任何端口

## 部署作业管理服务器

请参考[作业功能部署文档](./jobs.md#部署job-server-slurm)部署作业管理服务器。

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_APPS: 1
```

运行`docker compose up -d`更新系统。

## 编写应用配置文件

请参考[交互式应用](../apps/intro.md)编写交互式应用的配置文件。

每次修改配置文件后需要重启作业管理服务器和门户前端。

```bash
docker compose restart portal-web job-server
```