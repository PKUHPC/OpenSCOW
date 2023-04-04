---
sidebar_position: 3
title: 从源码构建
description: 从源码构建SCOW
---

## 从源码构建

目前系统处于公开测试阶段，暂不提供构建好的镜像下载。本部分介绍如何从源码构建项目的镜像。

1. 在服务节点中安装以下软件：
   - [docker](https://docs.docker.com/engine/install/)
   - [docker compose](https://docs.docker.com/compose/install/)

2. 从仓库clone项目

```bash
git clone %REPO_URL% --depth=1
```

3. 构建镜像

```bash
# 构建tag为scow:latest的镜像。如果需要修改镜像的tag，请修改-t参数的值
docker build -f docker/Dockerfile.scow -t scow .
```

:::tip

为了简化构建镜像时所需要的环境和减少所需时间，使用此命令构建镜像时，docker将会自动使用运行此命令时的机器的架构编译镜像。例如如果您在AMD64架构的机器上编译，编译出来的镜像仅支持AMD64架构。

请查看[多架构支持](./multi-platform.md)文档来了解系统对非AMD64架构（如ARM64）的机器的支持。

:::