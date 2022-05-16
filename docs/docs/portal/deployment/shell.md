---
sidebar_position: 2
title: 终端
---

# 部署终端功能

终端功能能够让用户在浏览器上就能访问集群的终端。

## 前提条件

要使用终端功能，请确认

- **服务节点**可以免密以**任何系统内的用户**SSH登录到各个集群的登录节点，并且服务节点的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件
- [集群配置文件](../../common/deployment/clusters.mdx)中需要使用此功能的集群已指定至少一个登录节点

## 配置门户前端

在`docker-compose.yml`文件的门户前端服务（`portal-web`）中，增加`ENABLE_SHELL`配置。

```yaml title=docker-compose.yml
  portal-web:
    # ...
    volumes:
      # ...
      # 将SSH目录映射进去
      - /root/.ssh:/root/.ssh
    environment:
      # ...
      ENABLE_SHELL: 1
```

运行`docker compose up -d`启动终端服务并更新门户前端。
