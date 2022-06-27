---
sidebar_position: 3
title: 服务端
---

# 部署运营系统服务端

运营系统服务端保存并执行运维操作相关业务逻辑。

## 部署源作业信息数据库

服务器会定期地从**源作业信息数据库**中获取已完成的作业信息，并根据规则对租户和账户进行扣费操作。详细计费规则请参考[计费收费](../business/billing.mdx)。本节介绍部署计费所需要的源作业信息数据库。

请参考[export-jobs](https://%GIT_PLATFORM%.com/%ORGANIZATION_NAME%/export-jobs)项目配置源作业信息数据库。

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
      - /root/.ssh:/root/.ssh
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
      FETCH_JOBS_DB_USER: 源作业信息表的用户名
      FETCH_JOBS_DB_PASSWORD: 源作业信息表的密码
      FETCH_JOBS_DB_DBNAME: 源作业信息表所在的数据库
      FETCH_JOBS_DB_TABLE_NAME: 源作业信息表的表名

      # 从源作业信息数据库里获取信息的周期的cron表示
      FETCH_JOBS_PERIODIC_FETCH_CRON: "10 */10 * * * *"

      # 如果配置了门户，本服务支持在用户创建时，将SSH公钥插入到每个集群的用户的authorized_keys中
      # 设置此配置为true打开此功能
      INSERT_SSH_KEY_WHEN_CREATING_USER: true
      # 设置此配置，设定每个集群的其中一个登录节点
      INSERT_SSH_KEY_LOGIN_NODES: hpc01=login01,hpc02=login02

      # 如果部署了门户，可以
      SHELL_SERVER_URL: http://shell-server:5000
      SHELL_SERVER_ADMIN_KEY: 和终端服务的ADMIN_KEY相同

      # 集群ID以及集群的clusterops地址，多个信息之间以,分割
      CLUSTERS: "hpc01=clusterops-hpc01:5000"
```

## 启动服务

运行`docker compose up -d`启动后端服务。