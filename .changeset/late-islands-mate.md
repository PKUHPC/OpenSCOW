---
"@scow/portal-server": patch
"@scow/portal-web": patch
---

修复只需在文件传输时使用 touch -a 来更新时间戳，修复 touch -a 执行时 ssh 关闭报错问题
