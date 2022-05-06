---
title: "clusterops-slurm"
---

# clusterops-slurm

## 环境变量配置






<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`SLURM_NODE_URL`|字符串|slurm节点的地址<br/>示例：192.168.2.3|**必填**|
|`SLURM_SCRIPT_PATH`|字符串|slurm脚本的路径<br/>示例：/root/slurm.sh|**必填**|
|`MYSQL_PASSWORD`|字符串|slurm.sh所需要的数据库密码|**必填**|
|`BASE_PARTITIONS`|字符串|所有分区，以逗号分隔<br/>示例：GPU,CPU|**必填**|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥目录|/home/ddadaal/.ssh/id_rsa|

<!-- ENV TABLE END -->





