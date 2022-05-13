---
title: "shell-server"
---

# shell-server

## 环境变量配置



<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`AUTH_URL`|字符串|认证服务地址。一定要加协议(http://)|http://auth:5000|
|`CLUSTERS`|字符串|集群名和地址。格式：集群名=对应登录节点地址,集群名=对应登录节点地址|**必填**|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥路径|~/.ssh/id_rsa|

<!-- ENV TABLE END -->


