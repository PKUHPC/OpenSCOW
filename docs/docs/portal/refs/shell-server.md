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
|`ADMIN_KEY`|字符串|带有这个key的请求可以访问/publicKey路径，访问时服务器将会把自己的public key加到所有集群的用户的authorized_keys里去|**必填**|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥路径|/home/ddadaal/.ssh/id_rsa|
|`SSH_PUBLIC_KEY_PATH`|字符串|SSH公钥路径|/home/ddadaal/.ssh/id_rsa.pub|

<!-- ENV TABLE END -->


