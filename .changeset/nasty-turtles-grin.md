---
"@scow/mis-server": patch
"@scow/mis-web": patch
---

修改Account实体中原blocked字段名为blocked_in_cluster，表示在集群中是否为封锁状态
增加字段state,字段值为"NORMAL","FROZEN","BLOCKED_BY_ADMIN"的枚举值，优化页面账户显示状态为正常、封锁、欠费
