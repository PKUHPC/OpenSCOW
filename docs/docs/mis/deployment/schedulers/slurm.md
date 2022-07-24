---
sidebar_position: 1
title: slurm
---

# 为管理系统后端配置使用slurm的集群

## 部署slurm.sh

将[slurm.sh](%REPO_FILE_URL%/apps/clusterops-slurm/slurm.sh)复制进每个集群的**slurm节点**，并给予可执行权限。

## 部署clusterops-slurm

在`config/mis.yaml`中的使用slurm集群的配置中，编写如下配置：

```yaml title=docker-compose.yml
  # 集群ID
  hpc01:
    slurm:
      # 部署slurm.sh的机器的地址
      managerUrl: haha
      # slurm.sh在机器中的绝对地址
      scriptPath: /test/slurm.sh
      # slurmdbd的数据库密码
      dbPassword: password
      # slurm accounting功能中，保存user_association信息的数据库的表名
      associationTableName: user_association
```
