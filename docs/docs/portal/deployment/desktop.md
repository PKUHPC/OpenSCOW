---
sidebar_position: 4
title: 桌面
---

# 部署桌面功能

桌面功能能够让用户在浏览器上就能访问集群的桌面，并进行GUI操作。

## 前提条件

目前，桌面功能仅支持登录到单个**登录节点**，且只支持xfce桌面。对计算节点上启动桌面以及使用其他桌面的功能的支持正在开发中。

下文中将启动桌面的节点称为**桌面节点**。

请确认集群配置满足以下条件：

- [集群配置文件](../../common/deployment/clusters.mdx)中需要使用此功能的集群已指定至少一个登录节点
- **服务节点**可以免密以任何用户SSH登录到各个**桌面节点**，并且**服务节点**的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- **服务节点**以及**门户前端**容器可以使用集群配置文件中的地址访问到会启动应用的任何一个桌面节点的任何端口
- **桌面节点**已安装TurboVNC（[官方安装教程](https://turbovnc.org/Downloads/YUM)）
- **桌面节点**已经安装xfce

## 部署作业管理服务器

请参考[作业功能部署文档](./jobs.md#部署job-server-slurm)部署作业管理服务器。

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_LOGIN_DESKTOP: 1
```

运行`docker compose up -d`更新系统。
