---
title: "file-server"
---

# file-server

## 环境变量配置



<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`AUTH_URL`|字符串|认证服务URL。一定要加协议(http://)|http://auth:5000|
|`USER_HOME`|字符串|用户的home目录的格式，用{userId}代替用户ID。示例：/nfs/{userId}|**必填**|

<!-- ENV TABLE END -->


