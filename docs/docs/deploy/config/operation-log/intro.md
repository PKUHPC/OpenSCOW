---
sidebar_position: 3
title: 配置操作日志服务
---

# 配置操作日志服务

本节介绍如何配置操作日志服务。

## 修改安装配置文件

修改安装配置文件

```yaml title="install.yaml"
# 确保操作日志服务会部署
operationLog:

  # dbPassword为管理系统数据库密码
  # 在系统第一次启动前可自由设置，使用此密码可以以root身份登录数据库
  # 一旦数据库启动后即不可修改
  # 必须长于8个字符，并同时包括字母、数字和符号
  dbPassword: "must!chang3this"
```

## 编写后端服务配置

在`config/operationLog.yaml`文件中，根据备注修改所需要的配置

```yaml title="config/mis.yaml"

# 操作日志服务的url，默认不修改
url: operation-log:5000
# 管理系统数据库的信息。可以不修改
db:
  host: operation-db
  port: 3306
  user: root
  password: mysqlrootpassword
  dbName: operation_log
```

## 启动服务

运行`./cli compose up -d`启动操作日志服务。
