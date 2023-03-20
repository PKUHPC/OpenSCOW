---
sidebar_position: 1
title: 安装
description: 如何在已有超算集群上部署SCOW系统
---

# 安装

本节介绍如何在已有的超算集群上部署SCOW系统。您可参考本文档在生产环境中部署SCOW。

## 集群要求

我们推荐将SCOW部署在一个**单独**的节点上。下文称部署这些组件的节点为**服务节点**。

要在您的集群上使用SCOW，请保证您的集群满足以下条件：

- 集群中的各个节点可相互通过网络连接
- **服务节点**可以免密以root用户SSH登录到各个**登录节点**，并且**服务节点**的`~/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
  - 运行所有部署的命令用户不需要为root，但是此用户的`~/.ssh`下的密钥对需可以以root用户登录登录节点
- **服务节点**可以SSH连接到所有**计算节点**，并且**计算节点**和**登录节点**的所有用户共享同样的`SSH authorized_keys`配置文件
- 使用slurm调度器，并且
  - 版本为21.08.4及以上
  - 已经部署slurm的[Accounting](https://slurm.schedmd.com/accounting.html#database-configuration)功能

:::caution

因为[这个issue](https://github.com/mscdex/ssh2/issues/989)，如果您的登录节点和计算节点的所使用的OpenSSH的版本高于**8.2**（大多比CentOS 7新的操作系统默认的版本均高于此），那么即使您能在SCOW节点上通过`ssh`命令连接到登录和计算节点上，SCOW可能也无法通过SSH连接到这些节点上。如果您遇到了这个问题，您需要在您的各个节点的`/etc/ssh/sshd_config`文件中增加以下内容，并重启`sshd`服务。

```bash
PubkeyAcceptedKeyTypes=+ssh-rsa
```

这是因为OpenSSH从8.2版本开始默认取消了对`ssh-rsa`公钥签名算法的支持（[OpenSSH 8.2 Release Note](https://www.openssh.com/txt/release-8.2)）。当前系统仅支持使用`ssh-rsa`类型的公钥对进行SSH登录，在后续我们会增加对使用更新算法（例如`ed25519`）的公私钥对的默认支持。

:::


## 准备环境

为了简化部署，系统组件以docker镜像的形式分发。服务节点应该安装好

- `docker`（[安装docker的官方文档](https://docs.docker.com/engine/install/)）
- `docker compose`（[安装docker compose的官方文档](https://docs.docker.com/compose/install/)）。

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

1. [编写集群信息配置文件](../config/cluster-config.md)
2. [配置认证系统](../config/auth/intro.md)
3. （可选）[配置门户系统](../config/portal/intro.md)
4. （可选）[配置管理系统](../config/mis/intro.md)

部署完成后，运行以下命令启动系统。

```bash
./compose.sh up -d
```

当修改了配置文件后，运行以下命令重启系统

```bash
./compose.sh restart
```
