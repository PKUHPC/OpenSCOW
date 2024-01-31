---
sidebar_position: 1
title: 配置 AI 系统（beta）
---

# 配置 AI 系统（beta）

本节介绍如何配置 **AI 系统（beta）**。

## 修改安装配置文件

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

## 修改集群配置文件

修改集群配置文件

```yaml title="config/clusters/hpc01/config.yml"

# 是否为 hpc 专用集群，为 true 时只在 portal 服务中展示该集群
hpcOnly: false

```

## 编写后端服务配置

在`config/ai/config.yaml`文件中，根据备注修改所需要的配置

当前 **AI 系统（beta）**版本中，我们支持通过 [HARBOR](https://goharbor.io/) 仓库对镜像进行保存及管理

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
  # HARBOR 仓库项目名称
  project: projectName
  # HARBOR 仓库可登录用户的用户名(需具有 HARBOR API 操作权限)
  user: user
  # HARBOR 仓库可登录用户的登录密码
  password: password

```

## 启动服务

运行`./cli compose up -d`启动 **AI 系统（beta）**服务。
