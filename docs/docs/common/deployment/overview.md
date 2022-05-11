---
sidebar_position: 1
title: 简介
---

# 安装和配置简介

为了简化部署，系统大部分组件以docker镜像的形式分发，少数组件分发可直接运行的单个可执行文件。

系统主要采用**环境变量**的形式进行配置，对于一些复杂的或者多个组件共用的配置（如集群信息）使用**配置文件**配置。配置文件均应映射到容器的`/etc/scow`目录下。配置文件支持yaml和json格式。系统在运行前将会对配置进行检查，如果配置不合法将会中止运行。

## 从源码构建

目前系统处于alpha阶段，暂不提供构建好的镜像和二进制下载。本部分介绍如何从源码构建项目的镜像和可执行文件。

1. 确保系统中安装了以下软件
    - [docker](https://docs.docker.com/engine/install/)
    - [docker compose](https://docs.docker.com/compose/install/)
    - [volta](https://volta.sh/)：管理node环境
    - [pnpm](https://pnpm.io/pnpm-cli)
2. 从仓库clone项目

```
git clone %REPO_URL% --depth=1
```

3. 修改`.env`目录中的`IMAGE_BASE`变量，以设置各个镜像的tag的前缀。

构建好的镜像的tag为`$IMAGE_BASE/组件名`，如`$IMAGE_BASE/gateway`等。

在后面的部署中，将docker-compose.yml中image修改为对应的值。例如将`%CR_URL%/gateway`修改为`$IMAGE_BASE/gateway`。

4. 构建镜像

```bash
docker compose build
```

5. 安装依赖并构建项目

```bash
pnpm i
pnpm run -r build
```

6. 二进制文件所在的位置如下表

| 项目          | 目录                                 |
| ------------- | ------------------------------------ |
| `file-server` | `apps/file-server/build/file-server` |


## 部署顺序

要部署SCOW，请先根据以下顺序部署基础环境，然后根据需要[部署门户系统](../../portal/intro.md)或者[管理系统](../../mis/intro.md)。

1. [准备环境](./prepare.md)
2. [部署认证系统](./auth.md)
3. [部署网关](./gateway.md)
4. [编写集群信息配置文件](./clusters.mdx)
