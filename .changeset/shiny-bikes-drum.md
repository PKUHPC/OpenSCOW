---
"@scow/config": patch
---

交互式应用 URL 修改为/api/proxy/集群 ID/代理类型/节点 hostname/端口。如果有交互式应用在使用 get_ip 函数以生成 base path，请将 get_ip 调用修改为 hostname
