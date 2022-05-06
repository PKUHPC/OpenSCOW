---
sidebar_position: 5
title: 网关
---

# 部署网关

网关(gateway)是整个系统的入口。本质上gateway就是一个提供了默认路由配置的nginx容器。

```yaml
  gateway:
    image: %CR_URL%/gateway
    restart: unless-stopped
    ports:
      - 80:80
    environment:
      # 增加配置
```

目前不需要更多的配置。

运行`docker compose up -d`启动网关，并访问`http://{地址}/auth/public/auth`查看是否能进入登录页面。如果可以进入，说明网关配置正确。

![登录页面](./pics/login.png)


