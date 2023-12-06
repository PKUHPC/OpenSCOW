---
"@scow/scheduler-adapter-protos": patch
"@scow/portal-server": patch
---

优化文件系统直接提交脚本任务时如果没有在脚本内部指定工作目录，使文件所在的绝对路径作为作业工作目录
