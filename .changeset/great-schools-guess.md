---
"@scow/mis-server": patch
"@scow/mis-web": patch
---

增加对用户及账户关系的错误兼容，如果适配器的报错都是已存在，视为添加成功，如果都是不存在，视为移除成功
