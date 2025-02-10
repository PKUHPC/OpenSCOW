---
"@scow/portal-web": patch
"@scow/mis-web": patch
"@scow/mis-server": patch
"@scow/auth": patch
"@scow/lib-auth": patch
---

修复部分 HttpError 的状态码判断为字符串导致前端无法正常展示错误的问题
