---
"@scow/lib-scow-resource": patch
"@scow/notification": patch
"@scow/lib-notification": patch
"@scow/resource": patch
"@scow/lib-server": patch
---

为资源管理系统、通知系统、管理系统、门户系统服务与服务之间的调用增加 token 校验,
** 注意，此 commit 之后，如配置资源管理系统或者通知系统，则需要配置 SCOW API Token **
