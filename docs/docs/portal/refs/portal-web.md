---
title: "portal-web"
---

# portal-web

## 环境变量配置



<!-- ENV TABLE START -->

| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|`AUTH_EXTERNAL_URL`|字符串|认证服务外网地址|/auth|
|`AUTH_INTERNAL_URL`|字符串|认证服务内网地址|http://auth:5000|
|`ENABLE_CHANGE_PASSWORD`|布尔值|是否支持用户更改自己的密码|false|
|`ENABLE_SHELL`|布尔值|是否启用Shell功能|false|
|`FILE_SERVERS`|字符串|启用文件管理功能的集群。格式：集群名,集群名。如果为空，则关闭文件管理的功能||
|`JOB_SERVERS`|字符串|作业服务器的地址。格式：集群ID=地址,集群ID=地址||
|`ENABLE_VNC`|布尔值|是否启动VNC功能|false|
|`DEFAULT_FOOTER_TEXT`|字符串|默认footer文本||
|`FOOTER_TEXTS`|字符串|根据域名(hostname，不包括port)不同，显示在footer上的文本。格式：域名=文本,域名=文本||
|`DEFAULT_PRIMARY_COLOR`|字符串|默认主题色|#9B0000|
|`PRIMARY_COLORS`|字符串|根据域名(hostname，不包括port)不同，应用的主题色。格式：域名=颜色,域名=颜色||
|`MIS_PATH`|字符串|管理系统的链接。如果不设置，则不显示到管理系统的链接|不设置|

<!-- ENV TABLE END -->


