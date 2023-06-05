---
sidebar_position: 2
title: SSH 
---

# SSH认证系统

本节介绍内置认证系统并采用SSH进行用户认证的认证系统。

SSH认证是非常简单的认证方式。用户可以直接使用和SSH登录集群相同的用户名和密码来登录系统。

在此认证方式中，用户的用户ID为其对应的Linux用户名，用户的姓名为其对应的Linux用户的[Gecos Field](https://en.wikipedia.org/wiki/Gecos_field)的full name字段。

SSH认证方式所支持的功能如下表：

| 功能             | 是否支持 |
| ---------------- | -------- |
| 用户登录         | 是       |
| 获取用户信息     | 是       |
| 用户创建         | 否       |
| 用户名和姓名验证 | 否       |
| 修改密码         | 否       |
| 管理用户账户关系 | 否       |

## 配置SSH认证服务

SSH认证方式要求编写好[集群配置文件](../cluster-config.md)，并且确保其中第一个集群有至少一个登录节点。

在`config/auth.yml`中输入以下内容：

```yaml title="config/auth.yml"
# 指定使用认证类型为SSH
authType: ssh
```

增加好配置后，运行`./cli compose restart`重启系统即可。
