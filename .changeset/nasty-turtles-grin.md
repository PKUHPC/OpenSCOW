---
"@scow/mis-server": patch
"@scow/mis-web": patch
---

修改 Account 实体中原 blocked 字段名为 blocked_in_cluster ，表示在集群中是否为封锁状态
增加字段 state ,字段值为 "NORMAL" , "FROZEN" , "BLOCKED_BY_ADMIN" 的枚举值，优化页面账户显示状态为正常、封锁、欠费
