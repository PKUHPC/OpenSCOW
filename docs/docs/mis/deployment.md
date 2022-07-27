---
sidebar_position: 3
title: 部署
---

# 部署管理系统

本节介绍如何部署管理系统。

## 部署源作业信息数据库

服务器会定期地从**源作业信息数据库**中获取已完成的作业信息，并根据规则对租户和账户进行扣费操作。详细计费规则请参考[计费收费](./business/billing.mdx)。

请参考[export-jobs](https://%GIT_PLATFORM%.com/%ORGANIZATION_NAME%/export-jobs)项目配置源作业信息数据库。

## 修改.env文件

修改部署路径下的.env文件

```env
# 确保COMPOSE_PROFILES中包括mis
# COMPOSE_PROFILES=mis
COMPOSE_PROFILES=mis,portal

# 如果本项目将会部署在域名的根目录下，按如下设置这两个变量
MIS_ROOT_URL=/
MIS_IMAGE_POSTFIX=root

# 如果将会部署在`/mis`路径下，按如下设置这两个变量
MIS_ROOT_URL=/mis
MIS_IMAGE_POSTFIX=mis

# 设置管理系统数据库密码
MIS_DB_PASSWORD=must!chang3this
```

## 更新集群配置文件

根据集群所使用的调度器的不同，参考对应文档更新`config/clusters/{集群ID}.yml`文件：

- [slurm](./schedulers/slurm.md)

## 编写后端服务配置

在`config/mis.yaml`文件中，根据备注修改所需要的配置

```yaml title="config/mis.yaml"
# 管理系统数据库的信息。可以不修改
db:
  host: db
  port: 3306
  user: root
  password: mysqlrootpassword
  dbName: scow

# 获取作业相关配置
fetchJobs:
  # 源作业信息数据库的数据库信息
  db:
    host: sourcedb
    port: 3307
    user: root
    password: jobtablepassword
    dbName: jobs
    tableName: jobs

  # 周期性获取数据
  periodicFetch:
    # 是否开启
    enabled: true
    # 周期的cron表达式
    cron: "10 */10 * * * *"

# 预定义的充值类型
predefinedChargingTypes:
  - 测试

# 账户名的规则
accountNamePattern:
  # 正则表达式
  # regex: ""

  # 出错时的消息
  # errorMessage: ""
```

## 启动服务

运行`docker compose up -d`启动管理系统。