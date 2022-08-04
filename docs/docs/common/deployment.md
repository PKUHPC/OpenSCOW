---
sidebar_position: 3
title: 部署
---

# 部署

本节介绍如何部署系统。

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

在部署的过程中，可能有的组件需要其他配置，请参考对应的文档。

## 从源码构建

目前系统处于alpha阶段，暂不提供构建好的镜像下载。本部分介绍如何从源码构建项目的镜像。

1. 在服务节点中安装以下软件：
    - [docker](https://docs.docker.com/engine/install/)
    - [docker compose](https://docs.docker.com/compose/install/)

2. 从仓库clone项目

```bash
git clone %REPO_URL% --depth=1
```

3. 构建镜像

```bash
docker compose --env-file dev/.env.build -f dev/docker-compose.build.yml build 
```

:::tip

您可以通过修改`dev/.env.build`文件来修改构建的镜像的名称和tag。

:::

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
cp .env.example .env
```

打开`.env`，根据内部备注提示修改基础配置。

```bash
vim .env
```

## 配置

根据以下顺序配置系统其他组件：

1. [编写集群信息配置文件](./clusterConfig.md)
2. [配置认证系统](./auth/index.md)
3. （可选）[配置门户系统](../portal/index.md)
4. （可选）[配置管理系统](../mis/index.md)

部署完成后，运行以下命令启动系统。

```bash
docker compose up -d
```

当修改了配置文件后，运行以下命令重启系统

```bash
docker compose restart
```
