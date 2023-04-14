---
sidebar_position: 2
title: 集群配置文件
---

# 集群配置文件

对于每个需要进行部署的集群，需要在`config/clusters`目录下创建一个`{集群ID}.yml`文件，并编写集群的信息。当您的集群信息修改后，您需要同时手动修改对应的集群配置文件。

```yaml title="config/clusters/hpc01.yml"
# 此文件为hpc01.yml，对应的集群ID为hpc01

# 集群显示名称
displayName: hpc01Name

# 指定slurm配置
slurm:
  # 各个登录节点的IP或者域名
  # 如果设置的是域名，请确认此节点的/etc/hosts中包含了域名到IP的解析信息
  loginNodes:
    - login01
    - login02

  # 集群的分区信息，结构为一个列表
  partitions:
    # 分区1的名字, 不能包含空格
    - name: compute
      # 分区内节点数
      nodes: 28
      # 单节点内存数量，单位M
      mem: 7500
      # 核心数
      cores: 2
      # GPU卡数
      gpus: 0
      # QOS
      qos:
        - low
        - normal
        - high
      # 这个分区的备注信息
      comment: ""

    - name: GPU
      nodes: 1
      mem: 262144
      cores: 48
      gpus: 8
      qos:
        - low
        - normal
        - high
      comment: ""
# 跨集群传输模块，可选功能
crossClusterFilesTransfer:
  # 传输结点，要求是公网ip，如不配置端口号则默认为22
  transferNode: 10.2.3.1:22222
```

:::caution

集群的分区名，即`slurm.partitions[].name`不能包含空格，否则系统将启动失败

:::