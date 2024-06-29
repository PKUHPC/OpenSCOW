---
"@scow/portal-server": patch
"@scow/portal-web": patch
"@scow/config": patch
"@scow/lib-server": patch
"@scow/lib-web": patch
---

修复门户系统集群登录节点只配置地址时路由渲染失败的问题，在集群配置接口返回中加入 scowd 配置信息
