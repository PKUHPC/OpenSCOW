---
sidebar_position: 4
title: 桌面
---

# 部署桌面功能

桌面功能能够让用户在浏览器上就能访问集群的桌面，并进行GUI操作。

## 前提条件

目前，桌面功能仅支持登录到单个节点，且只支持xfce桌面。对计算节点上启动桌面以及使用其他桌面的功能的支持正在开发中。

下文中将启动桌面的节点称为**桌面节点**。

请确认集群配置满足以下条件：

- **服务节点**可以连接到各个**桌面节点**
- **服务节点**可以免密以任何用户SSH登录到各个**桌面节点**，并且**服务节点**的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- **桌面节点**已安装TurboVNC（[官方安装教程](https://turbovnc.org/Downloads/YUM)）
- **桌面节点**已经安装xfce

## 部署作业管理服务器

请参考[作业功能部署文档](./job.md#部署file-server-slurm)部署作业管理服务器，并在每个作业管理服务器上增加以下配置：

```yml title=docker-compose.yml
  file-server-hpc01:
    # ...
    environment:
      # 启动VNC服务
      ENABLE_VNC: 1
      # turbovnc的安装目录。默认为/opt/TurboVNC，如果为默认可以不设置
      # TURBOVNC_PATH: /opt/TurboVNC
```

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_VNC: 1
```

运行`docker compose up -d`更新系统。
