---
"@scow/scheduler-adapter-protos": patch
"@scow/portal-server": patch
"@scow/portal-web": patch
---

优化文件系统直接提交脚本任务时如果没有在脚本内指定工作目录，使脚本文件所在的绝对路径作为作业工作目录，并在确认提交对话框中给出提示
