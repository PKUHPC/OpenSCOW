---
sidebar_position: 3
title: 服务端
---

# 部署运营系统服务端

运营系统服务端保存并执行运维操作相关业务逻辑。

## 部署源作业信息数据库

服务器会定期地从**源作业信息数据库**中获取已完成的作业信息，并根据规则对租户和账户进行扣费操作。详细计费规则请参考[计费收费](../business/billing.mdx)。

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

创建`config/mis.yaml`文件，并编写以下配置：

```yaml title="config/mis.yaml"
# 上述数据库的域名、端口、用户名、密码以及存放数据的数据库名
db:
  host: localhost
  port: 3306
  user: root
  password: mysqlrootpassword
  dbName: scow_server_${JEST_WORKER_ID}

# 获取作业相关配置
fetchJobs:
  # 源作业信息数据库的数据库信息
  db:
    host: 127.0.0.1
    port: 3307
    user: root
    password: jobtablepassword
    dbName: jobs
    tableName: jobs

# 集群相关配置
clusters:
  # 集群ID，需要对应集群配置文件中的集群ID
  hpc01:
    # 集群所使用的调度器的配置，见下文
```

其中集群所使用的调度器的配置部分，请根据每个集群所使用的调度器编写：

- [slurm](./schedulers/slurm.md)

## 部署服务

在服务节点的`docker-compose.yml`的`services`部分上配置服务：

```yml title=docker-compose.yml
  mis-server:
    image: %CR_URL%/mis-server
    volumes:
      - "./config:/etc/scow"
      - /root/.ssh:/root/.ssh
```

## 启动服务

运行`docker compose up -d`启动后端服务。