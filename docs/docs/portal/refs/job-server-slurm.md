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
|`LOGIN_NODES`|字符串|登录节点ID=登录节点地址<br/>示例：login01=login01,login02=login02|**必填**|
|`COMPUTE_NODES`|字符串|计算节点ID=计算节点IP<br/>示例：cn1=cn1,cn2=cn2|**必填**|
|`ENABLE_VNC`|布尔值|在所有节点上启动VNC服务|false|
|`TURBOVNC_PATH`|字符串|TurboVNC的安装路径|/opt/TurboVNC|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥目录|/home/ddadaal/.ssh/id_rsa|

<!-- ENV TABLE END -->


