---
sidebar_position: 2
title: 终端
---

# 部署终端功能

终端功能能够让用户在浏览器上就能访问集群的终端。

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
