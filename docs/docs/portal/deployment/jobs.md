---
sidebar_position: 2
title: 作业管理
---

# 部署作业管理

作业管理功能使用户能够在网页上管理、提交作业。

## 配置前端

在`docker-compose.yml`文件的门户前端服务（`portal-web`）中，增加以下配置。

```yaml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      ENABLE_JOB_MANAGEMENT: 1
```

运行`docker compose up -d`重启前端。
