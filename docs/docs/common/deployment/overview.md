---
sidebar_position: 1
title: 安装
---

# 安装和配置简介

在部署之前，您需要有一套或者多套已经部署好的超算集群。目前，我们仅支持使用slurm调度器的超算集群。

为了简化部署，系统组件以docker镜像的形式分发。

系统采用**环境变量**和**配置文件**配置。配置文件均应映射到容器的`/etc/scow`目录下。配置文件支持yaml和json格式。系统在运行前将会对配置进行检查，如果配置不合法将会中止运行。

## 从源码构建

目前系统处于alpha阶段，暂不提供构建好的镜像下载。本部分介绍如何从源码构建项目的镜像。

1. 确保系统中安装了以下软件
    - [docker](https://docs.docker.com/engine/install/)
    - [docker compose](https://docs.docker.com/compose/install/)

2. 从仓库clone项目

```bash
git clone %REPO_URL% --depth=1
```

3. 构建镜像

```bash
docker compose -f dev/docker-compose.build.yml build 
```

如果您需要修改构建的镜像的tag，那么您可以修改`.env`目录中的`IMAGE_BASE`和`TAG`变量，构建好的镜像的tag为`$IMAGE_BASE/组件名:$TAG`。在后面的部署中，将docker-compose.yml中image修改为对应的值。

例如，如果`IMAGE_BASE=myimage.com/scow`，那么网关服务的tag为`myimage.com/scow/gateway`。在后续部署gateway时，将`%CR_URL%/gateway`修改为`myimage.com/scow/gateway`。

仓库中的`.env`文件中设置的`IMAGE_BASE`和`TAG`变量的值与文档中所使用的镜像tag相同，所以如果您没有修改`.env`中的值，那么您在按文档部署时不需要修改`image`的值。

如果您需要推送镜像，运行 

```bash
docker compose -f dev/docker-compose.build.yml push
```


## 部署顺序

要部署SCOW，请先根据以下顺序部署基础环境，然后根据需要[部署门户系统](../../portal/intro.md)或者[管理系统](../../mis/intro.md)。

1. [准备环境](./prepare.md)
2. [部署认证系统](./auth.md)
3. [部署网关](./gateway.md)
4. [编写集群信息配置文件](./clusters.mdx)
