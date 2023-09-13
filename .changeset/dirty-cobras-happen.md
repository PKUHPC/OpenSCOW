---
"@scow/portal-web": patch
"@scow/mis-web": patch
"@scow/auth": patch
---

auth 登录跳转回 web 页面时，判断referer是否包含 AUTH_EXTERNAL_URL + '/public/auth'以区分用户登录操作和切换门户/管理系统
