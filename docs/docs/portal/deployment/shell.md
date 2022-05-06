---
sidebar_position: 2
title: 终端
---

# 部署终端功能

终端功能能够让用户在浏览器上就能访问集群的终端。

## 前提条件

要使用终端功能，请确认**服务节点**可以免密以root SSH登录到各个集群的登录节点，并且服务节点的`/root/.ssh`目录下有登录所需要的`id_rsa.pub`和`id_rsa`文件。

## 在服务节点上部署终端服务

在`docker-compose.yml`文件的`services`部分增加以下内容，且

- 使用`集群ID=集群登录节点地址,集群ID=集群登录节点地址`的格式定义`CLUSTERS`配置
- 生成一个足够强的密码，并将其设置为`ADMIN_KEY`配置

```yaml title=docker-compose.yml
  shell-server:
    image: %CR_URL%/shell-server
    volumes:
      - /root/.ssh:/root/.ssh
    environment:
      CLUSTERS: "hpc01=192.168.88.240"
      ADMIN_KEY: 随便设置一个强密码
```

## 配置门户前端

在`docker-compose.yml`文件的门户前端服务（`portal-web`）中，增加`ENABLE_SHELL`配置。

```yaml title=docker-compose.yml
  portal-web:
    # ...
    environment:
      # ...
      ENABLE_SHELL: 1
```

运行`docker compose up -d`启动终端服务并更新门户前端。
