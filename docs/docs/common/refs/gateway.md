---
title: "gateway"
---

# gateway

## 环境变量配置


| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`CLIENT_MAX_BODY_SIZE`|字符串|请求body最大大小，nginx的client_max_body_size配置|1g|
|`ACCESS_LOG`|字符串|nginx的access_log配置|/var/log/nginx/access.log|
|`ERROR_LOG`|字符串|nginx的error_log配置|/var/log/nginx/error.log|
|`EXTRA`|字符串|更多的配置，将会应用到server块里||
|`FILE_SERVERS`|字符串|集群ID与file-server地址的对应关系。file-server的地址需要能够从本服务处访问。<br/>     格式：集群ID=地址,集群ID=地址。地址一定要加协议和端口<br/>示例：hpc01=http://192.168.88.240:5000,hpc02=http://192.168.88.241:5233||
|`SUB_PATH`|字符串|如果要在同一个域名/IP下同时部署portal和web，那么建议把一个部署在/，另一个部署在子路径下，把此配置设置为子路径|/mis|
|`SUB_PATH_INTERNAL_URL`|字符串|子路径背后的内网地址。要能从此服务访问|http://mis-web:3000|
|`ROOT_PATH_INTERNAL_URL`|字符串|根路径背后的内网地址。要能从此服务访问|http://portal-web:3000|
|`SHELL_SERVER_INTERNAL_URL`|字符串|shell-server的后端地址。此地址要能本服务处访问。如果不部署shell-server，不设置即可|http://shell-server:5000|
|`AUTH_INTERNAL_URL`|字符串|auth的后端地址。此地址要能本服务处访问。|http://auth:5000|

