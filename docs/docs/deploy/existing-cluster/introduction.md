---
sidebar_position: 1
title: 在已有集群上部署
---

# 在已有集群上部署

本节介绍如何在已有的超算集群上部署SCOW系统。您可参考本文档在生产环境中部署SCOW。

## 集群要求

我们推荐将SCOW部署在一个**单独**的节点上。下文称部署这些组件的节点为**服务节点**。

要在您的集群上使用SCOW，请保证您的集群满足以下条件：

- 集群中的各个节点可相互通过网络连接
- **服务节点**可以免密以root用户SSH登录到各个**登录节点**，并且**服务节点**的`~/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
  - 运行所有部署的命令用户不需要为root，但是此用户的`~/.ssh`下的密钥对需可以以root用户登录登录节点
- 使用slurm调度器，并且
  - 版本为21.08.4及以上
  - 已经部署slurm的[Accounting](https://slurm.schedmd.com/accounting.html#database-configuration)功能

## 准备环境

为了简化部署，系统组件以docker镜像的形式分发。系统采用**环境变量**和**配置文件**配置。系统在运行前将会检查配置，如果配置不合法将会中止运行。

服务节点应该安装好`docker`（[安装docker的官方文档](https://docs.docker.com/engine/install/)）以及`docker compose`（[安装docker compose的官方文档](https://docs.docker.com/compose/install/)）。

## 获取部署文件

运行以下命令获取部署需要的文件：

```bash
git clone --depth=1 https://%GIT_PLATFORM%.com/%ORGANIZATION_NAME%/scow-deployment
cd scow-deployment
```

## 准备配置文件

运行以下命令从示例生成配置文件

```bash
cp -r config-example config
cp config-example.py config.py
```

打开`config.py`，根据内部备注提示修改基础配置。

```bash
vim config.py
```

## 配置

根据以下顺序配置系统：

1. [编写集群信息配置文件](../config/clusterConfig.md)
2. [配置认证系统](../config/auth/index.md)
3. （可选）[配置门户系统](../config/portal/index.md)
4. （可选）[配置管理系统](../config/mis/index.md)

部署完成后，运行以下命令启动系统。

```bash
./compose.sh up -d
```

当修改了配置文件后，运行以下命令重启系统

```bash
./compose.sh restart
```
