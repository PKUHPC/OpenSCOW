---
title: "vnc-server"
---

# vnc-server

## 环境变量配置



<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`NODES`|字符串|节点ID=节点IP<br/>示例：login01=login01,cn1=cn1|**必填**|
|`TURBOVNC_PATH`|字符串|TurboVNC的安装路径|/opt/TurboVNC|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥目录|/home/ddadaal/.ssh/id_rsa|

<!-- ENV TABLE END -->


