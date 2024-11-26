---
"@scow/mis-server": patch
"@scow/mis-web": patch
"@scow/lib-web": patch
---

平台统计页面最晚截止上一天，总额数据每日计算一次后存在数据库中并返回数据更新时间，UI 显示加上提示数据更新到昨天。
