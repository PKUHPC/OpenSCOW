---
slug: scow-scheduler-adapter
title: SCOW调度器适配器
authors: [quhan]
tags: [scow, scow-scheduler-adapter]

---

## 什么是调度器适配器

SCOW是建立在底层作业调度器基础上的系统，它通过与底层调度器进行功能对接，向用户提供各种超算功能。

在之前的实现中，scow直接与作业调度器本身交互，因此scow必须知道底层调度器内部的某些细节，
导致scow内部的某些代码是与调度器种类直接相关的（如最先适配的slurm），这会使适配其它调度器时比较麻烦。

调度器适配器（`scheduler-adapter`）则是为了解决这一问题，通过一层适配器层，scow只与适配器进行交互，
适配器再对接作业调度器，实现scow需要的调度器功能。

## 怎样实现调度器适配器

调度器适配器本质上是一个gRPC服务器，它实现了scow定义的一套[接口](https://github.com/PKUHPC/scow-scheduler-adapter-interface)，
scow只会调用这套接口来实现调度器功能。

因此，只需要为对应种类的作业调度器实现这样一个gRPC服务器，满足上述接口定义，就能够轻松对接scow系统

我们已经实现的调度器适配器：

- [slurm](https://github.com/PKUHPC/scow-slurm-adapter)

## 如何平滑升级

这一部分介绍如何从旧版本scow升级至新版本，使用调度器适配器

### 1. 部署调度器适配器

首先需要确保您的集群上部署了对应的调度器适配器，得到访问它的地址及端口号

部署适配器可参考文档：

- slurm

### 2. 修改SCOW配置文件

首先确保您使用了最新的SCOW镜像（可查看`install.yaml`中的`imageTag`字段）

在用于部署scow的`scow-deployment`文件夹中，修改配置文件：

- 首先修改[集群配置文件](%DOCS_URL%%BASE_PATH%docs/deploy/config/cluster-config)

  主要变化为删除`slurm`配置项, 将`loginNodes`配置项作为独立的一项配置。新增`adapterUrl`配置项，标识适配器地址

- 修改[管理系统配置文件](%DOCS_URL%%BASE_PATH%docs/deploy/config/mis/intro)

  删除了`fetchJobs`配置项中的`db`项，即不再采用源作业信息数据库，通过适配器同步作业信息

### 3. 不再使用源作业信息数据库

部署使用适配器后，可以不再部署[`export-jobs`](https://github.com/PKUHPC/export-jobs)项目，同步作业信息的功能由适配器完成