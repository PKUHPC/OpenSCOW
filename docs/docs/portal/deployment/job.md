---
sidebar_position: 2
title: 作业管理
---

# 部署作业管理

作业管理功能使用户能够在网页上管理、提交作业。

目前，我们只支持slurm。要部署slurm的作业管理功能，需要满足以下要求：

1. 每个集群单独部署一个作业管理服务器(job-server)
2. 每个作业管理服务器可以单独免密以任意用户SSH登录到对应集群的登录节点

本节介绍在服务节点上对每个集群单独部署一个作业管理服务器，且服务节点可以以任何用户免密SSH登录到各个集群的登录节点的情况。

## 部署job-server-slurm

在服务节点的`docker-compose.yml`文件的`services`部分中，对每个集群增加一个以下内容：

```yaml title=docker-compose.yml

  # 不同的clusterops应该有不同的服务名（即下一行）
  job-server-hpc01:
    image: %CR_URL%/job-server-slurm
    volumes:
      - /root/.ssh:/root/.ssh
    environment:
      # 登录节点ID=登录节点IP
      LOGIN_NODES: "login01=login01,login02=login02"
      # 计算节点ID=计算节点ID
      COMPUTE_NODES: "cn01=cn01,cn02=cn02"
```

运行`docker compose up -d`启动作业管理服务器。

## 配置前端

在`docker-compose.yml`文件的门户前端服务（`portal-web`）中，增加`JOB_SERVERS`配置。

```yaml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      # 集群ID=作业服务器地址,集群ID=作业服务器地址
      JOB_SERVERS: hpc01=job-server-hpc01:5000
```

运行`docker compose up -d`重启前端。