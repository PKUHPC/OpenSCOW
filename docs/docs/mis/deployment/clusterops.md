---
sidebar_position: 1
title: 集群操作层
---

# 部署集群操作层

clusterops是对集群操作的抽象层。

目前，我们只支持slurm。要部署slurm的clusterops，需要满足以下要求：

1. 每个集群需要有一个节点上安装了slurm（称为**slurm节点**），并能够使用`sacct`等命令
2. 服务节点可以免密以root SSH登录到各个集群的slurm节点

## 部署slurm.sh

将[slurm.sh](%REPO_FILE_URL%/apps/clusterops-slurm/slurm.sh)复制进每个集群的**slurm节点**，并给予可执行权限。

## 部署clusterops-slurm

在服务节点的`docker-compose.yml`文件的`services`部分中，对每个clusterops增加一个以下内容：

```yaml title=docker-compose.yml

  # 不同的clusterops应该有不同的服务名（即下一行）
  clusterops-hpc01:
    image: %CR_URL%/clusterops-slurm
    volumes:
      - /root/.ssh:/root/.ssh
    environment:
      # ssh到slurm节点的命令前缀，默认为ssh+slurm节点的IP
      SLURM_NODE_URL: 192.168.88.247
      # slurm.sh的绝对路径
      SLURM_SCRIPT_PATH: /root/HPCSH/slurm
      # slurm的MySQL数据库的密码
      MYSQL_PASSWORD: slurm的MySQL数据库的密码
      # 集群中的所有分区
      BASE_PARTITIONS: compute
```

运行`docker compose up -d`启动clusterops.