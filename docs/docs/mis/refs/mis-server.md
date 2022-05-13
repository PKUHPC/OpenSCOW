---
title: "mis-server"
---

# mis-server

## 环境变量配置






<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`HOST`|主机名|监听地址|0.0.0.0|
|`PORT`|端口号|监听端口|5000|
|`LOG_LEVEL`|字符串|日志等级|info|
|`DB_HOST`|主机名|数据库地址|**必填**|
|`DB_PORT`|端口号|数据库端口|**必填**|
|`DB_USER`|字符串|数据库用户名|**必填**|
|`DB_PASSWORD`|字符串|数据库密码|**必填**|
|`DB_DBNAME`|字符串|数据库数据库名|**必填**|
|`DB_DEBUG`|布尔值|打开ORM的debug模式|false|
|`CLUSTERS`|字符串|集群名和地址。格式：集群名=对应管理器地址,集群名=对应管理器地址|**必填**|
|`AUTH_URL`|字符串|认证服务的地址。一定要加协议(http://)|http://auth:5000|
|`INSERT_SSH_KEY_WHEN_CREATING_USER`|布尔值|是否在创建用户后给用户插入登录所需要的SSH公钥|false|
|`INSERT_SSH_KEY_LOGIN_NODES`|字符串|<br/>各个集群的其中一个登录节点的地址。集群中的存储应该是共享的，只要在一个登录节点上插入公钥就够了。<br/>格式：集群ID=节点地址,集群ID=节点地址<br/>    ||
|`INSERT_SSH_KEY_PUBLIC_KEY_PATH`|字符串|要插入的公钥的路径|~/.ssh/id_rsa.pub|
|`INSERT_SSH_KEY_PRIVATE_KEY_PATH`|字符串|要插入的私钥的路径|~/.ssh/id_rsa|
|`FETCH_JOBS_DB_HOST`|主机名|job_table数据库地址|**必填**|
|`FETCH_JOBS_DB_PORT`|端口号|job_table数据库端口|**必填**|
|`FETCH_JOBS_DB_USER`|字符串|job_table数据库用户名|**必填**|
|`FETCH_JOBS_DB_PASSWORD`|字符串|job_table数据库密码|**必填**|
|`FETCH_JOBS_DB_DBNAME`|字符串|job_table数据库名|**必填**|
|`FETCH_JOBS_DB_TABLE_NAME`|字符串|job_table中源数据所在的表名|**必填**|
|`FETCH_JOBS_START_INDEX`|数字|从哪个biJobIndex开始获取数据|0|
|`FETCH_JOBS_BATCH_SIZE`|数字|为了防止一次性获取太多数据占用过多内存，每次获取的任务信息数量。如果一次需要获取的信息超过这个数字，那么将会连续多次获取|100000|
|`FETCH_JOBS_PERIODIC_FETCH_ENABLED`|布尔值|是否启用周期性获取作业信息|true|
|`FETCH_JOBS_PERIODIC_FETCH_CRON`|字符串|获取信息的周期的cron表达式|* * 1 * * *|
|`JOB_PRICE_CHARGING_TYPE`|字符串|对作业计费时，发送给收费系统的付款类型|作业费用|
|`JOB_PRICE_CHANGE_CHARGING_TYPE`|字符串|修改作业费用时，发送给收费系统的付款/充值类型|作业费用更改|
|`JOB_CHARGE_COMMENT`|字符串|给作业扣费时，扣费项的备注。可以使用{price}使用作业信息中的字段。字段参考src/entities/JobInfo|集群: {cluster}，作业ID：{idJob}|

<!-- ENV TABLE END -->





