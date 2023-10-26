---
"@scow/mis-server": minor
"@scow/mis-web": minor
---

修改获取消费记录方式为分别获取当前页面详细记录及消费记录的总量，总额。在ChargeRecord实体中添加(time,type,account_name,tenant_name)的复合索引,索引名query_info
