---
"@scow/mis-server": patch
---

之前升级 mikroORM 时 cascade: [Cascade.ALL]属性会在删除 UserAccount 时把 User 和 Account 也删掉
