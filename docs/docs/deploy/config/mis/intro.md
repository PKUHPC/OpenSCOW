---
sidebar_position: 3
title: 配置管理系统
---

# 配置管理系统

本节介绍如何配置管理系统。

## 部署源作业信息数据库

服务器会定期地从**源作业信息数据库**中获取已完成的作业信息，并根据规则对租户和账户进行扣费操作。详细计费规则请参考[计费收费](../../../info/mis/business/billing.mdx)。

请参考[export-jobs](https://%GIT_PLATFORM%.com/%ORGANIZATION_NAME%/export-jobs)项目配置源作业信息数据库。

## 修改安装配置文件

修改安装配置文件

```yaml title="install.yaml"
# 确保管理系统会部署
mis:
  # 如果管理系统部署在`/mis`路径下，设置"MIS.BASE_PATH"为 "/mis"。默认为"/"
  basePath: "/mis"
  # 如果将会部署在域名的根目录下，设置"MIS.BASE_PATH"为 "/"
  basePath: "/"

  # dbPassword为管理系统数据库密码
  # 在系统第一次启动前可自由设置，使用此密码可以以root身份登录数据库
  # 一旦数据库启动后即不可修改
  # 必须长于8个字符，并同时包括字母、数字和符号
  dbPassword: "must!chang3this"
```

:::tip

如果想自定义系统部署的相对路径，或者了解`MIS.BASE_PATH`的含义，请参考[自定义相对路径](../customization/basepath.md)。

:::


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
    # 源作业信息库使用的mariadb或者mysql
    # 默认为mariadb
    # type: mariadb

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
# accountNamePattern:
  # 正则表达式
  # regex: ""

  # 出错时的消息
  # errorMessage: ""

# 用户ID的规则
# userIdPattern:
  # 正则表达式
  # regex: ""

  # 出错时的消息
  # errorMessage: ""
```

## 启动服务

运行`./cli compose up -d`启动管理系统。

## 系统初始化

查看[系统初始化](./init/index.md)文档初始化系统信息。