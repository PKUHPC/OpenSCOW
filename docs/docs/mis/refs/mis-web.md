---
title: "mis-web"
---

# mis-web

## 环境变量配置





<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`SERVER_URL`|字符串|后端服务地址|mis-server:5000|
|`AUTH_EXTERNAL_URL`|字符串|认证服务外网地址|/auth|
|`AUTH_INTERNAL_URL`|字符串|认证服务内网地址|http://auth:5000|
|`PREDEFINED_CHARGING_TYPES`|字符串|预定义的充值类型，格式：类型,类型,类型||
|`ACCOUNT_NAME_PATTERN`|正则表达式|账户名的正则规则|不设置|
|`ACCOUNT_NAME_PATTERN_MESSAGE`|字符串|创建账户名时如果账户名不符合规则显示什么。如果ACCOUNT_NAME_PATTERN没有设置，这个不生效|不设置|
|`PORTAL_PATH`|字符串|门户系统链接。如果不设置，则不显示到门户的链接|不设置|

<!-- ENV TABLE END -->



