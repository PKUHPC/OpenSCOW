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
|`FILE_SERVERS`|字符串|启用文件管理功能的集群。格式：集群名,集群名。如果为空，则关闭文件管理的功能||
|`ENABLE_JOB_MANAGEMENT`|布尔值|是否启动作业管理功能|false|
|`JOB_SERVER`|字符串|作业服务器的地址|job-server:5000|
|`ENABLE_LOGIN_DESKTOP`|布尔值|是否启动登录节点上的桌面功能|false|
|`ENABLE_APPS`|布尔值|是否启动交互式任务功能|false|
|`DEFAULT_FOOTER_TEXT`|字符串|默认footer文本||
|`FOOTER_TEXTS`|字符串|根据域名(hostname，不包括port)不同，显示在footer上的文本。格式：域名=文本,域名=文本||
|`DEFAULT_HOME_TEXT`|字符串|默认主页文本|北京大学计算中心成立于1963年，是集计算中心管理信息中心和网络中心于一体的实体单位，是独立建制的全校大型综合实验室，负责学校信息化基础设施的建设、开发与运行服务工作。|
|`HOME_TEXTS`|字符串|根据域名(hostname，不包括port)不同，显示在主页上的文本。格式：域名=文本,域名=文本||
|`DEFAULT_HOME_TITLE`|字符串|默认主页标题|北京大学计算中心高性能计算平台交互式工具|
|`HOME_TITLES`|字符串|根据域名(hostname，不包括port)不同，显示在主页上的标题。格式：域名=标题,域名=标题||
|`DEFAULT_PRIMARY_COLOR`|字符串|默认主题色|#9B0000|
|`PRIMARY_COLORS`|字符串|根据域名(hostname，不包括port)不同，应用的主题色。格式：域名=颜色,域名=颜色||
|`MIS_PATH`|字符串|管理系统的链接。如果不设置，则不显示到管理系统的链接|不设置|
|`ENABLE_SHELL`|布尔值|是否启用Shell功能|false|
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥路径|~/.ssh/id_rsa|
|`SUBMIT_JOB_DEFAULT_PWD`|字符串|提交作业的默认工作目录。使用{name}代替作业名称。相对于用户的家目录|scow/jobs/{name}|
|`PROXY_BASE_PATH`|字符串|代理地址的根路径|/proxy|

<!-- ENV TABLE END -->


