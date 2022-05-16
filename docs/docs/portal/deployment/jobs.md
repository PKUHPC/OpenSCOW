---
sidebar_position: 2
title: 作业管理
---

# 部署作业管理

作业管理功能使用户能够在网页上管理、提交作业。

## 前提条件

目前，我们只支持slurm。要部署slurm的作业管理功能，需要满足以下要求：

- 作业管理服务器所在机器可以单独免密以任意用户SSH登录到对应集群的登录节点
- [集群配置文件](../../common/deployment/clusters.mdx)中需要使用此功能的集群已指定至少一个登录节点

## 部署job-server-slurm

在服务节点的`docker-compose.yml`文件的`services`部分中，增加以下内容：

```yaml title=docker-compose.yml
  job-server:
    image: %CR_URL%/job-server-slurm
    volumes:
      # 映射配置文件
      - ./config:/etc/scow
      # 将SSH目录映射进去
      - /root/.ssh:/root/.ssh
```

运行`docker compose up -d`启动作业管理服务器。

## 配置前端

在`docker-compose.yml`文件的门户前端服务（`portal-web`）中，增加以下配置。

```yaml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_JOB_MANAGEMENT: 1
      JOB_SERVER: job-server:5000
```

运行`docker compose up -d`重启前端。
