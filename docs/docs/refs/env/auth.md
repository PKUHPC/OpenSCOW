---
title: "auth"
---

# auth

## 环境变量配置






<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`BASE_PATH`|字符串|认证系统部署地址的base path|/|
|`AUTH_TYPE`|字符串|认证类型。将会覆写配置文件<br/>可选项：ldap,ssh|不设置|
|`TEST_USERS`|字符串|测试用户，如果这些用户登录，将其ID改为另一个ID。格式：原用户ID=新用户ID,原用户ID=新用户ID。||

<!-- ENV TABLE END -->





