---
sidebar_position: 2
title: 集群信息配置文件
---

# 编写集群信息配置文件

对于每个需要进行部署的集群，需要在`config/clusters`目录下创建一个`{集群ID}.yml`文件，并编写集群的信息。

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

  # 各个计算节点的IP，服务节点必须可访问
  # 如果设置的是域名，请确认此节点的/etc/hosts中包含了域名到IP的解析信息
  computeNodes:
    - cn01
    - cn02

  # 集群的分区信息，结构为一个列表
  partitions:
    # 分区1的名字
    - name: compute
      # 分区内节点数
      nodes: 28
      # 单节点内存数量，单位M
      mem: 7500
      # 核心数
      cores: 2
      # GPU数
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
```