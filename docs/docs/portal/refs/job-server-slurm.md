---
title: "job-server-slurm"
---

# job-server-slurm

## 环境变量配置



<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`TURBOVNC_PATH`|字符串|TurboVNC的安装路径|/opt/TurboVNC|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥目录|~/.ssh/id_rsa|
|`JOBS_DIR`|字符串|存放作业脚本以及相关内容的父目录，相对于用户的家目录|jobs|
|`MAX_DISPLAY`|数字|最大连接桌面数量|3|

<!-- ENV TABLE END -->


