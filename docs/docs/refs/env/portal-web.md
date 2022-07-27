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
|`LOGIN_NODES`|字符串|集群的登录节点。将会覆写配置文件。格式：集群ID=登录节点,集群ID=登录节点||
|`SSH_PRIVATE_KEY_PATH`|字符串|SSH私钥路径|~/.ssh/id_rsa|
|`MOCK_USER_ID`|字符串|覆盖已登录用户的用户ID|不设置|
|`PROXY_BASE_PATH`|字符串|网关的代理路径|/proxy|
|`MIS_URL`|字符串|如果部署了管理系统，设置URL或者路径。将会覆盖配置文件。空字符串等价于未设置||

<!-- ENV TABLE END -->


