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

loginNodes:
    # 登录节点展示名称
  - name: login01
    # 各个登录节点的IP或者域名
    # 如果设置的是域名，请确认此节点的/etc/hosts中包含了域名到IP的解析信息
    address: 192.168.88.102
  - name: login02
    address: 192.168.88.103

# 登录节点桌面功能
loginDesktop:
  # 是否启用桌面功能
  enabled: true

  # 桌面
  wms: 
    # 桌面名和对应的wm值。见文档
    - name: Xfce
      wm: xfce

  # 单个登录节点最多启动多少个桌面节点
  maxDesktops: 3

# TurboVNC的安装路径
turboVNCPath: /opt/TurboVNC
```

## 注意
集群配置里的登录节点桌面功能和TurboVNC的安装路径配置为该集群特有，如不需要特殊配置该集群的这些功能，可在[门户系统](./portal/intro.md)进行统一配置；若在集群下配置以上功能，在该集群内将会覆盖门户系统下的配置。
