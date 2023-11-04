---
sidebar_position: 3
title: 配置管理系统
---

# 配置管理系统

本节介绍如何配置管理系统。

## 管理系统同步作业信息

服务器会定期地从**调度器适配器**中获取已完成的作业信息，并根据规则对租户和账户进行扣费操作。详细计费规则请参考[计费收费](../../../info/mis/business/billing.mdx)。

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

## 部署调度器适配器

根据调度器种类的不同，需要在集群上部署对应的调度器适配器

- slurm

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
  # 从哪个时间点开始获取作业(日期格式ISO 8601)
  # startDate: ""

  # 限制一次获取的作业数量
  # batchSize: 1000

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

# 创建用户相关配置
# createUser:

  # 当认证系统允许创建用户时，是否启用SCOW中创建用户的配置
  # enabled: true

  # 用户ID的规则
  # userIdPattern:
    # 正则表达式
    # regex: ""

    # 出错时的消息
    # errorMessage: ""

# # 新增导航链接相关配置
# navLinks:
#   # 链接名
#   - text: "一级导航1"
#     # 链接地址，一级导航链接地址为可选填，二级导航链接地址为必填
#     url: ""
#     # 是否打开新的页面，可选填，默认值为false
#     # openInNewPage: true
#     # 自定义图标地址,可选填
#     # iconPath: ""
#     # 可以看到这个链接的用户,可选填
#     # 用户类型： user, accountUser, accountAdmin, accountOwner, tenantFinance, tenantAdmin, platformAdmin, platformFinance
#     allowedRoles: []
#     # 二级导航,可选填
#     children:
#       # 二级导航相关配置，与一级导航相同，但是url为必填配置，同时不允许再设置children
#       - text: "二级导航1"
#         url: "https://hahahaha1.1.com"
#         # openInNewPage: true
#         iconPath: ""
#         allowedRoles: [accountAdmin, accountOwner]
#       - text: "二级导航2"
#         url: "https://hahahaha1.2.com"
#         allowedRoles: [tenantAdmin, platformAdmin]
#   - text: "一级导航2"
#     url: "https://hahahaha2.com"

```

## 启动服务

运行`./cli compose up -d`启动管理系统。

## 系统初始化

查看[系统初始化](./init/index.md)文档初始化系统信息。