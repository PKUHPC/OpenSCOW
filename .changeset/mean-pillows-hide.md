---
"@scow/portal-server": patch
"@scow/portal-web": patch
"@scow/config": patch
"@scow/grpc-api": patch
---

优化创建交互式应用页面：在用户家目录下的 apps/app[Id]路径下存入上一次提交记录；创建了查找上一次提交记录的 API 接口，每次创建交互式应用时查找上一次提交记录，如果有则与当前集群下配置对比选择填入相应的值。
