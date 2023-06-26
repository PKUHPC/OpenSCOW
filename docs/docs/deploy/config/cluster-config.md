---
sidebar_position: 2
title: 集群配置文件
---

# 集群配置文件

对于每个需要进行部署的集群，需要在`config/clusters`目录下创建一个`{集群ID}/config.yml`（或`{集群ID}.yml`）文件，并编写集群的信息。当您的集群信息修改后，您需要同时手动修改对应的集群配置文件。

```yaml title="config/clusters/hpc01/config.yml"
# 此文件为hpc01.yml，对应的集群ID为hpc01

# 集群显示名称
displayName: hpc01Name

# 调度器适配器地址(ip地址:端口号)
adapterUrl: localhost:8972

# 各个登录节点的IP或者域名
# 如果设置的是域名，请确认此节点的/etc/hosts中包含了域名到IP的解析信息
loginNodes:
  - login01
  - login02
```