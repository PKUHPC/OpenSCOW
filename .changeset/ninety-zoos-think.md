---
"@scow/grpc-api": patch
---

当 mis-server 正在进行一次封锁状态同步时，调用 server/AdminService.UpdateBlockStatus API 会抛出`AlreadyExists`错误
