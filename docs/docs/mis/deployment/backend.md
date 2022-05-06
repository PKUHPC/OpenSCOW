---
sidebar_position: 3
title: 服务端
---

# 部署运营系统服务端

运营系统服务端保存并执行运维操作相关业务逻辑。

## 部署数据库

运营系统目前支持MySQL 8.0及以上版本的数据库。在`docker-compose.yml`中安装并配置数据库：

```yml title=docker-compose.yml
services:
  # ...
  db:
    image: mysql:8
    volumes:
      - "db_data:/var/lib/mysql"
    environment:
      MYSQL_ROOT_PASSWORD=数据库root密码
    ports:
      - 3306:3306

volumes:
  db_data: {}
```

运行`docker compose up -d`启动数据库。

## 编写后端服务配置

在服务节点的`docker-compose.yml`的`services`部分上配置服务：

```yml title=docker-compose.yml
  mis-server:
    image: %CR_URL%/mis-server
    volumes:
      - "./config:/etc/scow"
    environment:
      # 数据库的域名、端口、用户名、密码以及存放数据的数据库名
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: root
      DB_PASSWORD: 和mysql容器的MYSQL_ROOT_PASSWORD相同
      DB_DBNAME: server

      # 源作业信息数据库的数据库信息
      FETCH_JOBS_DB_HOST: 192.168.88.227
      FETCH_JOBS_DB_PORT: 3306
      FETCH_JOBS_DB_USER: scow
      FETCH_JOBS_DB_PASSWORD: FXl944+q
      FETCH_JOBS_DB_DBNAME: hpc01
      FETCH_JOBS_DB_TABLE_NAME: job_table

      # 从源作业信息数据库里获取信息的周期的cron表示
      FETCH_JOBS_PERIODIC_FETCH_CRON: "10 */10 * * * *"

      # 如果部署了终端功能，配置终端服务的地址以及admin key
      SHELL_SERVER_URL: http://shell-server:5000
      SHELL_SERVER_ADMIN_KEY: 和终端服务的ADMIN_KEY相同

      # 集群ID以及集群的clusterops地址，多个信息之间以,分割
      CLUSTERS: "hpc01=clusterops-hpc01:5000"
```

## 创建初始费用项目

数据库启动以及配置项编写完成后，请根据[快速创建费用规则](../business/billing.mdx#快速创建费用规则)文档创建您的集群的所有QOS的费用项目。

## 启动服务

运行`docker compose up -d`启动后端服务。