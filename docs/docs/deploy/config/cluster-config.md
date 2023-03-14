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
  # 各个登录节点的地址、ssh端口和ssh密钥路径
  # 如果设置的是域名，请确认此节点的/etc/hosts中包含了域名到IP的解析信息
  # 如果只有一个string类型，则表示ssh端口默认为22，密钥路径默认为~/.ssh/id_rsa
  loginNodes:
      - login01
      - host: login02
        port: 22222
        key: ~/.ssh/rsa/id_rsa

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