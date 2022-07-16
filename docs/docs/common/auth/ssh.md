---
sidebar_position: 1
title: SSH 
---

# SSH认证系统

本节介绍采用SSH进行用户认证的认证系统。如果您的系统采用其他认证方式，您可以参考文档中的其他认证方式，或者查看[自定义认证](./custom.md)文档以自己实现符合自己需求的认证方式。

SSH认证是非常简单的认证方式。用户可以直接使用和SSH登录集群相同的用户名和密码来登录系统。

SSH认证方式要求编写好[集群配置文件](../deployment/clusters.mdx)，并确保其中第一个集群有至少一个登录节点。

SSH认证方式所支持的功能如下表：

| 功能             | 是否支持 |
| ---------------- | -------- |
| 用户登录         | 是       |
| 用户创建         | 否       |
| 用户名和姓名验证 | 否       |
| 修改密码         | 否       |

## 安装并配置SSH认证服务

### 部署redis

LDAP认证系统将认证信息存放在redis中，所以在部署认证系统之前需要先部署redis。

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  redis:
    image: redis:alpine
    restart: unless-stopped
    ports:
      - 6379:6379
```

运行`docker compose up -d`启动redis。

### 部署并配置SSH认证服务

在`docker-compose.yml`的`services`块中添加以下条目:

```yaml title=docker-compose.yml
  auth:
    image: %CR_URL%/auth
    restart: unless-stopped
    environment:
      # 默认即为ssh，可以不设置
      AUTH_TYPE: ssh
      
```

增加好配置后，运行`docker compose up -d`启动认证系统即可。
