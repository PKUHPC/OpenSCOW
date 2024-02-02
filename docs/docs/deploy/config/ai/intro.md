---
sidebar_position: 1
title: 配置 AI 系统（beta）
---

# 配置 AI 系统（beta）

本节介绍如何配置 **AI 系统（beta）**。

# Beta期间配置

SCOW AI当前处于Beta状态，其代码将会和SCOW主线共存，但是SCOW AI的版本发布周期将是独立的，不和SCOW本身同步。

您可以在GitHub的Release中找到格式为`ai-beta.{数字}`的Release，这些Release以及对应的Tag均为SCOW AI的Beta发布版本。快速到所有`ai-beta.` Release的链接[点击此处](https://github.com/PKUHPC/SCOW/releases?q=ai-beta.&expanded=true)。

要使用SCOW AI的具体的版本，您需要修改`install.yml`的`imageTag`为一个具体的`ai-beta.{数字}`的tag，例如：：

```yaml title="install.yaml"
# 指定使用Beta 1版本
imageTag: ai-beta.1  
```

您同样可以使用`master`来跟踪SCOW主线以及其包括的SCOW AI的最新功能。

## 前期准备

**AI 系统（beta）**需要您底层已部署**K8S集群**、已安装并行文件存储服务，并通过**SCOW调度器适配器**已实现对**K8S集群**的调度服务。

同时为了满足提交**AI**训练作业，使用和保存镜像等功能，需要使用第三方调度插件[Kueue](https://kueue.sigs.k8s.io/docs/)，
第三方镜像管理仓库[Harbor](https://goharbor.io/)。

另外，在**AI 系统（beta）**中我们仍然延续**SCOW**系统的认证系统服务，采用[LDAP](../../config/auth/ldap.md)认证系统进行用户认证。
在**K8S**集群中仍然需要像**SCOW**系统的**hpc集群**一样，在管理节点安装**LDAP服务端**，在所有节点安装**LDAP客户端**。

### K8S集群

**AI 系统（beta）**需运行在**K8S**集群服务。这需要用户在使用时提前部署**K8S**的集群环境。

当前**AI 系统（beta）**为试用版本，我们暂时只支持在**docker**容器运行时中执行镜像相关的服务，后续会陆续推出支持**ContainerD**等主流容器运行时的**AI 系统**。
当前版本**K8S**部署的主要版本信息如下：

| **安装内容**  | **版本信息** |
| ------------- | ------------ |
| kubernetes    | v1.19.13     |
| Docker Engine | 19.03.12     |

### K8S调度服务

#### 第三方调度插件Kueue

**Kueue**是一个用于**Kubernetes**的作业排队系统。它旨在管理和优化批处理作业和其他非实时工作负载的执行。**Kueue**的安装下载参照[此链接](https://kueue.sigs.k8s.io/docs/installation/)。

#### 配置ClusterQueue

**ClusterQueue** 允许基于不同的策略和需求对作业进行分组管理。

**ClusterQueue**的配置与实际部署的**K8S集群**情况紧密相关，推荐您按照[ClusterQueue](https://kueue.sigs.k8s.io/docs/concepts/cluster_queue/)和实际部署集群的详细情况进行配置。


#### K8S调度器适配器

在**AI 系统（beta）**中，我们仍然使用[SCOW调度器适配器](https://pkuhpc.github.io/SCOW/blog/scow-scheduler-adapter)来实现**K8S**的调度服务。

当前版本中，我们提供了调度器适配器的适用版本的二进制文件[scow-ai-adapter-amd64](https://mirrors.pku.edu.cn/scow/releases/)，欢迎下载进行试用。

**K8S调度器适配器**的配置请参照[此链接](https://github.com/PKUHPC/scow-ai-adapter-config)。

### Harbor

当前 **AI 系统（beta）**版本中，我们支持通过 [Harbor](https://goharbor.io/) 仓库对镜像进行保存及管理。

为了实现镜像的保存、上传、分享、复制、删除等功能，需要您已部署可访问的**Harbor**镜像仓库。

当前版本中，我们暂时只支持通过**Http**协议实现的**Harbor API V2.0**版本接口的访问，所以需要您部署支持该版本接口的**Harbor**镜像仓库。


## 配置文件

### 修改安装配置文件

修改安装配置文件

```yaml title="install.yaml"
# 确保 AI 系统会部署
ai:

  # dbPassword 为 AI 系统数据库密码
  # 在系统第一次启动前可自由设置，使用此密码可以以 root 身份登录数据库
  # 一旦数据库启动后即不可修改
  # 必须长于 8 个字符，并同时包括字母、数字和符号
  dbPassword: "must!chang3this"
```

### 编写 AI 服务配置

在`config/ai/config.yaml`文件中，根据备注修改所需要的配置

```yaml title="config/ai/config.yaml"

# AI 系统服务的 url，默认不修改
url: ai:5000
# AI 系统数据库的信息。可以不修改
db:
  host: ai-db
  port: 3306
  user: root
  password: must!chang3this
  dbName: scow_ai
  debug: true
# AI 系统镜像保存 HARBOR 仓库
harborConfig:
  # HARBOR 仓库地址
  url: 10.0.0.xxx
  # Harbor 仓库项目名称
  project: projectName
  # Harbor 仓库可登录用户的用户名(需具有 HARBOR API V2.0 接口调用权限)
  user: user
  # Harbor 仓库可登录用户的登录密码
  password: password

```

## 启动服务

运行`./cli compose up -d`启动 **AI 系统（beta）**服务。
