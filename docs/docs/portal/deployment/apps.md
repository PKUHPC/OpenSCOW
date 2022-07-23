---
sidebar_position: 5
title: 交互式应用
---

# 部署交互式应用

交互式应用功能能够让用户在浏览器上使用集群资源启动应用，并通过浏览器使用这些应用。

## 配置门户前端

在`docker-compose.yml`的`services`部分，给门户前端服务增加配置：

```yml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_APPS: 1
```

运行`docker compose up -d`更新系统。

## 编写应用配置文件

请参考[交互式应用](../apps/intro.md)编写交互式应用的配置文件。

每次修改配置文件后需要重启作业管理服务器和门户前端。

```bash
docker compose restart portal-web job-server
```