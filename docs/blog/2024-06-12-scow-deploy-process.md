---
slug: scow-deploy-process
title: SCOW部署流程
authors: [huangjun]
tags: [scow, scow-deployment]
---

#  1. 前提条件

- **slurm集群准备完毕，且开启了[Accounting](https://slurm.schedmd.com/accounting.html#database-configuration)功能**，部署slurm集群可参考[slurm集群部署实践](../docs/hpccluster/index.md)；
- **slurm集群各节点实现了LDAP认证**，提供两个基于CentOS7的脚本用来快速搭建和配置LDAP，修改两个文件开头部分的相关配置（`Start Configuratin Part`和`End Configuration Part`之间的变量），运行即可：
  - [provider.sh](https://github.com/PKUHPC/SCOW/blob/master/dev/ldap/provider.sh): 用于配置LDAP服务器
  - [client.sh](https://github.com/PKUHPC/SCOW/blob/master/dev/ldap/client.sh): 用于配置LDAP客户端
- **slurm集群挂载了并行文件系统**，例如lustre、gpfs等，提供[NFS的搭建](/docs/hpccluster/nfs)供参考。



